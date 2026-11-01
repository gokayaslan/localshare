(() => {
  'use strict';

  // GitHub Pages adresini buraya yaz (örnek: 'https://kullanici.github.io/localshare/').
  // İndirilen kopya dosyadan açıldığında QR kod bu adresi gösterir, telefon da bu adresi açar.
  // Sayfa zaten internet adresinden açılmışsa bu ayar kullanılmaz.
  const PUBLIC_URL = 'https://gokayaslan.github.io/localshare/';

  const $ = (s) => document.querySelector(s);
  const CHUNK = 128 * 1024;          // her parça 128 KB
  const HIGH_WATER = 4 * 1024 * 1024; // gönderim tamponu 4 MB'ı geçerse bekle
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const target = new URLSearchParams(location.search).get('c'); // QR ile gelen karşı kod
  let peer = null;
  let conn = null;
  let myId = null;
  let sendQueue = Promise.resolve();
  let incoming = {};
  let active = 0;
  let wakeLock = null;

  // ---------- Yardımcılar ----------
  function randomId() {
    const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789'; // 32 karakter, karışan harfler yok
    const r = crypto.getRandomValues(new Uint8Array(10));
    return 'ls-' + Array.from(r, (x) => alphabet[x % 32]).join('');
  }
  function uid() {
    return (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()) + Math.random().toString(16).slice(2);
  }
  function fmtSize(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(0) + ' KB';
    if (n < 1073741824) return (n / 1048576).toFixed(1) + ' MB';
    return (n / 1073741824).toFixed(2) + ' GB';
  }
  async function lock() {
    active++;
    try {
      if ('wakeLock' in navigator && !wakeLock) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      }
    } catch (e) { /* ekran açık tutma desteklenmiyor olabilir */ }
  }
  function unlock() {
    active = Math.max(0, active - 1);
    if (active === 0 && wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
  }

  // ---------- Durum ve ekranlar ----------
  function setChip(kind, text) {
    const chip = $('#chip');
    chip.className = 'chip ' + kind;
    chip.textContent = text;
  }
  function showView(name) {
    $('#pairView').hidden = name !== 'pair';
    $('#transferView').hidden = name !== 'transfer';
  }
  function pairMessage(text, isErr) {
    const el = $('#pairMsg');
    el.textContent = text || '';
    el.className = 'msg' + (isErr ? ' err' : '');
  }

  function showQR(id) {
    const base = location.protocol === 'file:'
      ? PUBLIC_URL.replace(/[?#].*$/, '')
      : location.origin + location.pathname;
    const url = base + '?c=' + id;
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    const n = qr.getModuleCount();
    const margin = 2;
    let d = '';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (qr.isDark(r, c)) d += 'M' + (c + margin) + ' ' + (r + margin) + 'h1v1h-1z';
      }
    }
    const size = n + margin * 2;
    $('#qr').innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" shape-rendering="crispEdges">' +
      '<rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
    $('#code').textContent = id;
    $('#copyBtn').onclick = async () => {
      try { await navigator.clipboard.writeText(url); pairMessage('Bağlantı kopyalandı.'); }
      catch (e) { pairMessage(url); }
    };
  }

  // ---------- Bağlantı ----------
  function start() {
    myId = randomId();
    const needsUrl = location.protocol === 'file:' && !PUBLIC_URL;
    if (!target) {
      // Kimlik yerelde üretildiği için QR kodu sunucuyu beklemeden hemen göster
      showQR(myId);
      showView('pair');
      setChip('wait', 'Sunucuya bağlanıyor…');
      if (needsUrl) {
        pairMessage('Bu kopyada herkese açık adres ayarlı değil. app.js dosyasının başındaki PUBLIC_URL satırına GitHub Pages adresini yaz.', true);
      }
    }
    peer = new Peer(myId);
    const openTimer = setTimeout(() => {
      if (peer && !peer.open && !needsUrl) {
        pairMessage('Eşleşme sunucusuna bağlanılamadı. İnternet bağlantını kontrol edip sayfayı yenile.', true);
      }
    }, 10000);
    peer.on('open', (id) => {
      clearTimeout(openTimer);
      if (target) {
        connectTo(target);
      } else {
        setChip('wait', 'Bağlantı bekleniyor');
        if (!needsUrl) pairMessage('');
      }
    });
    peer.on('connection', (c) => {
      if (target) { c.close(); return; }
      attach(c);
    });
    peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) { /* yoksay */ } });
    peer.on('error', (e) => {
      if (e.type === 'unavailable-id') { peer.destroy(); start(); return; }
      if (e.type === 'peer-unavailable') {
        fail('Karşı cihaz bulunamadı. Bilgisayardaki sayfanın açık olduğundan emin ol.');
      } else if (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error') {
        fail('Eşleşme sunucusuna ulaşılamadı. İnternet bağlantını kontrol et.');
      } else {
        fail('Bağlantı hatası (' + e.type + ').');
      }
    });
  }

  function fail(text) {
    setChip('err', 'Hata');
    if (peer && peer.id) { showQR(peer.id); }
    showView('pair');
    pairMessage(text, true);
  }

  function connectTo(id) {
    setChip('wait', 'Bağlanıyor…');
    pairMessage('Bağlanıyor…');
    const c = peer.connect(id.trim(), { reliable: true });
    attach(c);
    setTimeout(() => {
      if (conn === c && !c.open) fail('Bağlantı kurulamadı. İki cihaz da internete bağlı mı? Bazı ağlar doğrudan bağlantıya izin vermez.');
    }, 20000);
  }

  function attach(c) {
    if (conn && conn !== c) { const old = conn; conn = c; try { old.close(); } catch (e) { /* yoksay */ } }
    conn = c;
    c.on('open', () => {
      setChip('ok', 'Bağlandı');
      showView('transfer');
    });
    c.on('data', onData);
    c.on('close', () => {
      if (conn !== c) return;
      conn = null;
      incoming = {};
      while (active > 0) unlock();
      setChip('wait', 'Bağlantı koptu');
      if (peer && peer.id) showQR(peer.id);
      showView('pair');
      pairMessage('Bağlantı koptu. Yeniden bağlanmak için QR kodu tekrar okut.');
    });
    c.on('error', () => fail('Bağlantıda bir sorun çıktı.'));
  }

  // ---------- Liste öğeleri ----------
  function addItem(dir, name, size) {
    $('#empty').hidden = true;
    const li = document.createElement('li');
    li.className = 'item';
    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    thumb.textContent = dir === 'in' ? 'Al' : 'Gön';
    const meta = document.createElement('div');
    meta.className = 'meta';
    const nm = document.createElement('div');
    nm.className = 'name';
    nm.textContent = name;
    const sub = document.createElement('div');
    sub.className = 'sub';
    sub.textContent = fmtSize(size) + (dir === 'in' ? ' · alınıyor' : ' · gönderiliyor');
    const bar = document.createElement('progress');
    bar.max = 1; bar.value = 0;
    meta.append(nm, sub, bar);
    const actions = document.createElement('div');
    actions.className = 'actions';
    li.append(thumb, meta, actions);
    $('#items').prepend(li);

    return {
      progress(p) { bar.value = p; },
      done(text) { bar.remove(); sub.textContent = fmtSize(size) + ' · ' + text; },
      fail(text) { bar.remove(); sub.textContent = text; sub.className = 'sub err'; },
      ready(blob, fileName) {
        bar.remove();
        sub.textContent = fmtSize(size) + ' · alındı';
        const url = URL.createObjectURL(blob);
        if (blob.type.startsWith('image/')) {
          const img = document.createElement('img');
          img.src = url; img.alt = '';
          thumb.textContent = '';
          thumb.append(img);
        }
        const a = document.createElement('a');
        a.href = url; a.download = fileName; a.textContent = 'Kaydet';
        actions.append(a);
        try {
          const f = new File([blob], fileName, { type: blob.type });
          if (navigator.canShare && navigator.canShare({ files: [f] })) {
            const b = document.createElement('button');
            b.type = 'button'; b.textContent = 'Paylaş';
            b.onclick = () => navigator.share({ files: [f] }).catch(() => {});
            actions.append(b);
          }
        } catch (e) { /* yoksay */ }
      },
    };
  }

  // ---------- Gönderme ----------
  function enqueue(file) {
    const item = addItem('out', file.name, file.size);
    sendQueue = sendQueue
      .then(() => sendFile(file, item))
      .catch((e) => item.fail(e && e.message ? e.message : 'Gönderilemedi'));
  }

  async function sendFile(file, item) {
    if (!conn || !conn.open) throw new Error('Bağlı değil');
    await lock();
    try {
      const id = uid();
      conn.send({ t: 'meta', id, name: file.name, size: file.size, type: file.type });
      let off = 0;
      while (off < file.size) {
        if (!conn || !conn.open) throw new Error('Bağlantı koptu');
        const buf = await file.slice(off, off + CHUNK).arrayBuffer();
        while (conn && conn.open && conn.dataChannel && conn.dataChannel.bufferedAmount > HIGH_WATER) {
          await sleep(25);
        }
        if (!conn || !conn.open) throw new Error('Bağlantı koptu');
        conn.send({ t: 'chunk', id, data: buf });
        off += buf.byteLength;
        item.progress(off / file.size);
      }
      conn.send({ t: 'end', id });
      item.done('gönderildi');
    } finally {
      unlock();
    }
  }

  // ---------- Alma ----------
  function onData(m) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'meta') {
      lock();
      incoming[m.id] = {
        name: String(m.name || 'dosya'), size: Number(m.size) || 0, type: String(m.type || ''),
        parts: [], got: 0, item: addItem('in', String(m.name || 'dosya'), Number(m.size) || 0),
      };
    } else if (m.t === 'chunk') {
      const r = incoming[m.id];
      if (!r) return;
      r.parts.push(m.data);
      r.got += m.data.byteLength;
      r.item.progress(r.size ? r.got / r.size : 1);
    } else if (m.t === 'end') {
      const r = incoming[m.id];
      if (!r) return;
      delete incoming[m.id];
      r.item.ready(new Blob(r.parts, { type: r.type || 'application/octet-stream' }), r.name);
      unlock();
    }
  }

  // ---------- Arayüz olayları ----------
  const fileInput = $('#fileInput');
  $('#pickBtn').onclick = () => fileInput.click();
  fileInput.onchange = () => {
    for (const f of fileInput.files) enqueue(f);
    fileInput.value = '';
  };
  const drop = $('#drop');
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => {
    for (const f of e.dataTransfer.files) enqueue(f);
  });
  $('#leaveBtn').onclick = () => { if (conn) conn.close(); };
  $('#codeForm').onsubmit = (e) => {
    e.preventDefault();
    const v = $('#codeInput').value.trim();
    if (v) connectTo(v);
  };

  // ---------- Yükleme (PWA) ----------
  let installEvent = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installEvent = e;
    $('#installBtn').hidden = false;
  });
  $('#installBtn').onclick = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    installEvent = null;
    $('#installBtn').hidden = true;
  };
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (isIos && !standalone) $('#iosHint').hidden = false;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  if (typeof Peer === 'undefined' || typeof qrcode === 'undefined') {
    setChip('err', 'Hata');
    pairMessage('Gerekli kütüphaneler yüklenemedi. İnternet bağlantını kontrol edip sayfayı yenile.', true);
  } else {
    start();
  }
})();
