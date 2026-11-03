(() => {
  'use strict';

  // GitHub Pages adresi. İndirilen kopya dosyadan açıldığında QR kod bu adresi gösterir.
  // Sayfa zaten internet adresinden açılmışsa bu ayar kullanılmaz.
  const PUBLIC_URL = 'https://gokayaslan.github.io/localshare/';

  const $ = (s) => document.querySelector(s);
  const CHUNK = 128 * 1024;
  const HIGH_WATER = 4 * 1024 * 1024;
  const RETRY_MS = 4000;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* yoksay */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* yoksay */ } },
  };
  function rnd(n) {
    const a = 'abcdefghijkmnpqrstuvwxyz23456789';
    return Array.from(crypto.getRandomValues(new Uint8Array(n)), (x) => a[x % 32]).join('');
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

  // ---------- Bağlantıdan gelenler ----------
  let linkId = null, linkKey = null, pendingText = null;
  (function readLink() {
    const qs = new URLSearchParams(location.search);
    const hs = new URLSearchParams(location.hash.replace(/^#/, ''));
    const uniq = [];
    [qs.get('title'), qs.get('text'), qs.get('url')].filter(Boolean).forEach((p) => {
      if (!uniq.some((u) => u.includes(p))) uniq.push(p);
    });
    pendingText = uniq.join('\n') || null;
    linkId = qs.get('c');
    linkKey = hs.get('k');
    if (location.search || location.hash) {
      try { history.replaceState(null, '', location.pathname); } catch (e) { /* yoksay */ }
    }
  })();

  // ---------- Rol: bilgisayar (host) ya da telefon (client) ----------
  let role = 'host';
  let pairing = null;
  if (linkId && linkKey) {
    pairing = { id: linkId, key: linkKey };
    store.set('ls_client', pairing);
    role = 'client';
  } else {
    const saved = store.get('ls_client');
    if (saved && saved.id && saved.key) { pairing = saved; role = 'client'; }
  }

  let peer = null, conn = null, host = null, denied = false, retryTimer = null;
  let sendQueue = Promise.resolve();
  let incoming = {};
  let active = 0, wakeLock = null;

  async function lock() {
    active++;
    try {
      if ('wakeLock' in navigator && !wakeLock) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      }
    } catch (e) { /* yoksay */ }
  }
  function unlock() {
    active = Math.max(0, active - 1);
    if (active === 0 && wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
  }

  // ---------- Ekranlar ----------
  function setChip(kind, text) {
    const chip = $('#chip');
    chip.className = 'chip ' + kind;
    chip.textContent = text;
  }
  function showView(name) {
    $('#pairView').hidden = name !== 'pair';
    $('#waitView').hidden = name !== 'wait';
    $('#transferView').hidden = name !== 'transfer';
  }
  function setMsg(sel, text, isErr) {
    const el = $(sel);
    el.textContent = text || '';
    el.className = 'msg' + (isErr ? ' err' : '');
  }
  const pairMessage = (t, e) => setMsg('#pairMsg', t, e);
  const waitMessage = (t, e) => setMsg('#waitMsg', t, e);

  function showQR() {
    const base = location.protocol === 'file:'
      ? PUBLIC_URL.replace(/[?#].*$/, '')
      : location.origin + location.pathname;
    const url = base + '?c=' + host.id + '#k=' + host.key;
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
    $('#copyBtn').onclick = async () => {
      try { await navigator.clipboard.writeText(url); pairMessage('Bağlantı kopyalandı.'); }
      catch (e) { pairMessage(url); }
    };
  }

  // ---------- Bilgisayar tarafı ----------
  const needsUrl = location.protocol === 'file:' && !PUBLIC_URL;

  function startHost() {
    host = store.get('ls_host');
    if (!host || !host.id || !host.key) {
      host = { id: 'ls-' + rnd(10), key: rnd(16) };
      store.set('ls_host', host);
    }
    showQR();
    showView('pair');
    setChip('wait', 'Sunucuya bağlanıyor…');
    if (needsUrl) pairMessage('Bu kopyada herkese açık adres ayarlı değil. app.js dosyasının başındaki PUBLIC_URL satırına GitHub Pages adresini yaz.', true);
    hostPeer(0);
  }

  function hostPeer(tries) {
    peer = new Peer(host.id);
    peer.on('open', () => {
      setChip('wait', 'Telefon bekleniyor');
      if (!needsUrl) pairMessage('');
    });
    peer.on('connection', attachHost);
    peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) { /* yoksay */ } });
    peer.on('error', (e) => {
      if (e.type === 'unavailable-id') {
        peer.destroy();
        if (tries < 10) {
          pairMessage('Eşleşme kimliği meşgul. LocalShare başka bir pencerede açık olabilir, yeniden deniyorum…');
          setTimeout(() => hostPeer(tries + 1), 3000);
        } else {
          pairMessage('LocalShare bu bilgisayarda başka bir pencerede açık görünüyor. Diğerini kapatıp sayfayı yenile.', true);
        }
      } else if (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error') {
        setChip('err', 'Hata');
        pairMessage('Eşleşme sunucusuna ulaşılamadı. İnternet bağlantını kontrol et.', true);
      } else {
        setChip('err', 'Hata');
        pairMessage('Bağlantı hatası (' + e.type + ').', true);
      }
    });
  }

  function attachHost(c) {
    c.on('data', (m) => {
      if (c._auth) { onData(m); return; }
      if (m && m.t === 'hello' && m.k === host.key) {
        c._auth = true;
        if (conn && conn !== c) { try { conn.close(); } catch (e) { /* yoksay */ } }
        conn = c;
        c.send({ t: 'welcome' });
        onConnected();
      } else {
        try { c.send({ t: 'denied' }); } catch (e) { /* yoksay */ }
        setTimeout(() => { try { c.close(); } catch (e) { /* yoksay */ } }, 300);
      }
    });
    c.on('close', () => { if (conn === c) { conn = null; onDisconnected(); } });
    c.on('error', () => {});
  }

  // ---------- Telefon tarafı ----------
  function startClient() {
    showView('wait');
    setChip('wait', 'Bağlanıyor…');
    waitMessage('Bilgisayara bağlanılıyor…');
    peer = new Peer('ls-' + rnd(10));
    peer.on('open', connectClient);
    peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) { /* yoksay */ } });
    peer.on('error', (e) => {
      if (e.type === 'unavailable-id') { peer.destroy(); startClient(); return; }
      if (e.type === 'peer-unavailable') {
        waitMessage('Bilgisayar bulunamadı. Bilgisayarda LocalShare açık mı? Yeniden deniyorum…');
      } else {
        waitMessage('Eşleşme sunucusuna ulaşılamadı. İnternet bağlantını kontrol et. Yeniden deniyorum…', true);
      }
      scheduleRetry();
    });
  }

  function retry() {
    if (denied || (conn && conn.open)) return;
    if (!peer || peer.destroyed || !peer.open) {
      try { if (peer) peer.destroy(); } catch (e) { /* yoksay */ }
      startClient();
    } else {
      connectClient();
    }
  }
  function scheduleRetry() {
    if (denied || retryTimer) return;
    retryTimer = setTimeout(() => { retryTimer = null; retry(); }, RETRY_MS);
  }

  function connectClient() {
    if (denied || (conn && conn.open)) return;
    setChip('wait', 'Bağlanıyor…');
    const c = peer.connect(pairing.id, { reliable: true });
    const to = setTimeout(() => { if (!c._auth) { try { c.close(); } catch (e) { /* yoksay */ } } }, 12000);
    c.on('open', () => c.send({ t: 'hello', k: pairing.key }));
    c.on('data', (m) => {
      if (c._auth) { onData(m); return; }
      if (m && m.t === 'welcome') {
        c._auth = true;
        clearTimeout(to);
        conn = c;
        onConnected();
      } else if (m && m.t === 'denied') {
        denied = true;
        store.del('ls_client');
        showView('wait');
        setChip('err', 'Eşleşme geçersiz');
        waitMessage('Bilgisayar bu eşleşmeyi tanımadı. Bilgisayardaki QR kodu yeniden okut.', true);
      }
    });
    c.on('close', () => {
      clearTimeout(to);
      if (conn === c) { conn = null; onDisconnected(); }
      if (!denied) scheduleRetry();
    });
    c.on('error', () => { clearTimeout(to); if (!denied) scheduleRetry(); });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && role === 'client' && !denied && !(conn && conn.open)) {
      if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
      retry();
    }
  });

  // ---------- Bağlantı durumları ----------
  function onConnected() {
    setChip('ok', 'Bağlandı');
    showView('transfer');
    $('#hostOnly').hidden = role !== 'host';
    $('#leaveBtn').textContent = role === 'host' ? 'Eşleşmeyi sıfırla' : 'Eşleşmeyi sil';
    if (pendingText) { const t = pendingText; pendingText = null; sendText(t); }
  }
  function onDisconnected() {
    incoming = {};
    while (active > 0) unlock();
    if (role === 'host') {
      setChip('wait', 'Telefon bekleniyor');
      pairMessage('Telefon ayrıldı. Telefonda LocalShare açılınca kendiliğinden yeniden bağlanır.');
      showView('pair');
    } else {
      setChip('wait', 'Bağlanıyor…');
      waitMessage('Bağlantı koptu, yeniden deniyorum…');
      showView('wait');
    }
  }
  function resetPairing() {
    if (role === 'host') {
      if (!confirm('Eşleşme sıfırlansın mı? Telefonu yeniden eşleştirmen gerekir.')) return;
      store.del('ls_host');
      location.reload();
    } else {
      if (!confirm('Bu telefondaki eşleşme silinsin mi?')) return;
      store.del('ls_client');
      location.replace(location.pathname);
    }
  }

  // ---------- Liste öğeleri ----------
  function itemShell(thumbText, name, subText) {
    $('#empty').hidden = true;
    const li = document.createElement('li');
    li.className = 'item';
    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    thumb.textContent = thumbText;
    const meta = document.createElement('div');
    meta.className = 'meta';
    const nm = document.createElement('div');
    nm.className = 'name';
    nm.textContent = name;
    const sub = document.createElement('div');
    sub.className = 'sub';
    sub.textContent = subText;
    meta.append(nm, sub);
    const actions = document.createElement('div');
    actions.className = 'actions';
    li.append(thumb, meta, actions);
    $('#items').prepend(li);
    return { li, thumb, meta, sub, actions };
  }

  function addItem(dir, name, size) {
    const s = itemShell(dir === 'in' ? 'Al' : 'Gön', name, fmtSize(size) + (dir === 'in' ? ' · alınıyor' : ' · gönderiliyor'));
    const bar = document.createElement('progress');
    bar.max = 1; bar.value = 0;
    s.meta.append(bar);
    return {
      progress(p) { bar.value = p; },
      done(text) { bar.remove(); s.sub.textContent = fmtSize(size) + ' · ' + text; },
      fail(text) { bar.remove(); s.sub.textContent = text; s.sub.className = 'sub err'; },
      ready(blob, fileName) {
        bar.remove();
        s.sub.textContent = fmtSize(size) + ' · alındı';
        const url = URL.createObjectURL(blob);
        if (blob.type.startsWith('image/')) {
          const img = document.createElement('img');
          img.src = url; img.alt = '';
          s.thumb.textContent = '';
          s.thumb.append(img);
        }
        const a = document.createElement('a');
        a.href = url; a.download = fileName; a.textContent = 'Kaydet';
        s.actions.append(a);
        try {
          const f = new File([blob], fileName, { type: blob.type });
          if (navigator.canShare && navigator.canShare({ files: [f] })) {
            const b = document.createElement('button');
            b.type = 'button'; b.textContent = 'Paylaş';
            b.onclick = () => navigator.share({ files: [f] }).catch(() => {});
            s.actions.append(b);
          }
        } catch (e) { /* yoksay */ }
      },
    };
  }

  function addTextItem(dir, text) {
    const preview = text.replace(/\s+/g, ' ').trim().slice(0, 80) || '(boş)';
    const s = itemShell('Aa', preview, 'Metin · ' + (dir === 'in' ? 'alındı' : 'gönderildi'));
    if (dir !== 'in') return;
    const copy = document.createElement('button');
    copy.type = 'button'; copy.textContent = 'Kopyala';
    copy.onclick = () => {
      navigator.clipboard.writeText(text)
        .then(() => { copy.textContent = 'Kopyalandı'; setTimeout(() => { copy.textContent = 'Kopyala'; }, 1500); })
        .catch(() => { copy.textContent = 'Kopyalanamadı'; });
    };
    s.actions.append(copy);
    if (/^https?:\/\/\S+$/i.test(text.trim())) {
      const a = document.createElement('a');
      a.href = text.trim(); a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'Aç';
      s.actions.append(a);
    }
  }

  // ---------- Gönderme ----------
  function sendText(text) {
    if (!conn || !conn.open || !text) return false;
    conn.send({ t: 'text', text: text.slice(0, 200000) });
    addTextItem('out', text);
    return true;
  }

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
  function textArrived(text) {
    if ($('#autoCopy').checked) navigator.clipboard.writeText(text).catch(() => {});
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      try { new Notification('LocalShare', { body: text.slice(0, 120) }); } catch (e) { /* yoksay */ }
    }
  }

  function onData(m) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'text' && typeof m.text === 'string') {
      const text = m.text.slice(0, 200000);
      addTextItem('in', text);
      if (role === 'host') textArrived(text);
    } else if (m.t === 'meta') {
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
  drop.addEventListener('drop', (e) => { for (const f of e.dataTransfer.files) enqueue(f); });

  $('#sendTextBtn').onclick = () => {
    const box = $('#textIn');
    const t = box.value.trim();
    if (!t) { setMsg('#note', 'Önce bir şey yaz.', true); return; }
    if (sendText(t)) { box.value = ''; setMsg('#note', ''); }
  };
  $('#pasteBtn').onclick = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t && t.trim()) { sendText(t); setMsg('#note', ''); } else setMsg('#note', 'Pano boş.', true);
    } catch (e) {
      setMsg('#note', 'Panoya erişim izni verilmedi. Metni kutuya yapıştırıp gönderebilirsin.', true);
    }
  };

  $('#leaveBtn').onclick = resetPairing;
  $('#resetHostBtn').onclick = resetPairing;
  $('#forgetBtn').onclick = resetPairing;
  $('#retryBtn').onclick = () => {
    denied = false;
    if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
    waitMessage('Bilgisayara bağlanılıyor…');
    retry();
  };

  $('#codeForm').onsubmit = (e) => {
    e.preventDefault();
    const v = $('#codeInput').value.trim();
    try {
      const u = new URL(v);
      const c = u.searchParams.get('c');
      const k = new URLSearchParams(u.hash.replace(/^#/, '')).get('k');
      if (c && k) {
        store.set('ls_client', { id: c, key: k });
        location.replace(location.pathname);
        return;
      }
    } catch (err) { /* aşağıdaki mesaj */ }
    pairMessage('Bu bir LocalShare bağlantısına benzemiyor.', true);
  };

  const auto = $('#autoCopy');
  auto.checked = store.get('ls_autocopy') === true;
  auto.onchange = () => store.set('ls_autocopy', auto.checked);
  $('#notifBtn').onclick = async () => {
    if (!('Notification' in window)) { setMsg('#note', 'Bu tarayıcı bildirimleri desteklemiyor.', true); return; }
    const r = await Notification.requestPermission();
    $('#notifBtn').textContent = r === 'granted' ? 'Bildirimler açık' : 'Bildirimlere izin verilmedi';
  };
  if ('Notification' in window && Notification.permission === 'granted') $('#notifBtn').textContent = 'Bildirimler açık';

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

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

  // ---------- Başlat ----------
  if (typeof Peer === 'undefined' || typeof qrcode === 'undefined') {
    setChip('err', 'Hata');
    showView('pair');
    pairMessage('Gerekli kütüphaneler yüklenemedi. İnternet bağlantını kontrol edip sayfayı yenile.', true);
  } else if (role === 'host') {
    startHost();
  } else {
    startClient();
  }
})();
