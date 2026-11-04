const { app, BrowserWindow, Tray, Menu, Notification, session, shell, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

app.setAppUserModelId('io.github.gokayaslan.localshare');

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

const startHidden = process.argv.includes('--hidden');
let win = null;
let tray = null;
let quitting = false;

const ALLOWED = ['notifications', 'clipboard-read', 'clipboard-sanitized-write'];

function showWindow() {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
}

function createWindow() {
  win = new BrowserWindow({
    width: 480,
    height: 820,
    minWidth: 380,
    minHeight: 600,
    title: 'LocalShare',
    autoHideMenuBar: true,
    backgroundColor: '#eaf0ef',
    icon: path.join(__dirname, 'web', 'icon-512.png'),
    show: !startHidden,
    webPreferences: {
      backgroundThrottling: false, // pencere gizliyken de bağlantı canlı kalsın
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'web', 'index.html'));

  // Bildirim iznini otomatik iste (yalnızca kendi sayfamız için verilir)
  win.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript(
      "'Notification' in window && Notification.permission === 'default' && Notification.requestPermission()"
    ).catch(() => {});
  });

  // Dış bağlantıları varsayılan tarayıcıda aç
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) {
      e.preventDefault();
      if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    }
  });

  // Pencereyi kapatınca uygulama çalışmaya devam eder (sistem tepsisinde)
  win.on('close', (e) => {
    if (!quitting) {
      e.preventDefault();
      win.hide();
    }
  });
}

function createTray() {
  const img = nativeImage.createFromPath(path.join(__dirname, 'web', 'icon-192.png')).resize({ width: 16, height: 16 });
  tray = new Tray(img);
  tray.setToolTip('LocalShare');
  const menu = Menu.buildFromTemplate([
    { label: 'LocalShare’i aç', click: showWindow },
    {
      label: 'Windows ile başlat',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: (item) => app.setLoginItemSettings({ openAtLogin: item.checked, args: ['--hidden'] }),
    },
    { type: 'separator' },
    { label: 'Çık', click: () => { quitting = true; app.quit(); } },
  ]);
  tray.setContextMenu(menu);
  tray.on('click', showWindow);
}

app.whenReady().then(() => {
  const ses = session.defaultSession;
  ses.setPermissionRequestHandler((wc, permission, cb) => {
    cb(ALLOWED.includes(permission) && wc.getURL().startsWith('file://'));
  });
  ses.setPermissionCheckHandler((wc, permission) => ALLOWED.includes(permission));

  // Gelen dosyaları İndirilenler\LocalShare klasörüne kaydet
  ses.on('will-download', (event, item) => {
    const dir = path.join(app.getPath('downloads'), 'LocalShare');
    fs.mkdirSync(dir, { recursive: true });
    const name = path.basename(item.getFilename() || 'dosya');
    const ext = path.extname(name);
    const base = path.basename(name, ext);
    let target = path.join(dir, base + ext);
    for (let i = 1; fs.existsSync(target); i++) target = path.join(dir, `${base} (${i})${ext}`);
    item.setSavePath(target);
    item.once('done', (e, state) => {
      if (state !== 'completed') return;
      const n = new Notification({ title: 'LocalShare', body: 'Kaydedildi: ' + path.basename(target) });
      n.on('click', () => shell.showItemInFolder(target));
      n.show();
    });
  });

  createWindow();
  createTray();
});

app.on('second-instance', showWindow);
app.on('before-quit', () => { quitting = true; });
app.on('window-all-closed', () => { /* tepside çalışmaya devam et */ });
