# LocalShare

Telefon ile bilgisayar arasında dosya ve fotoğraf aktar. **Aynı Wi-Fi'de olmana gerek yok.** Bilgisayardaki QR kodu telefonla okut, cihazlar doğrudan birbirine bağlansın.

- Windows, macOS, Linux, Android ve iPhone'da çalışır (web uygulaması / PWA)
- Hesap, kurulum ya da sunucu gerekmez
- Dosyalar iki cihaz arasında doğrudan (WebRTC) gider, hiçbir yerde saklanmaz

## Nasıl kullanılır

1. Bilgisayarda uygulamanın adresini aç (aşağıdaki "GitHub'a yükleme" adımlarından sonra `https://KULLANICI.github.io/localshare/` gibi bir adresin olacak).
2. Ekranda QR kod çıkar. Telefonun kamerasıyla okut, açılan bağlantıya dokun.
3. İki cihaz bağlanınca "Bağlandı" yazar. İki yönde de "Dosya veya fotoğraf seç" ile gönderebilirsin.
4. Gelen dosyada **Kaydet** (ya da telefonda **Paylaş**) düğmesine bas.

QR okutamıyorsan: bilgisayardaki "Kod" yazısını telefonda sayfanın altındaki kutuya yaz.

## İndirilen kopyayı kullanma (zip / Download ZIP)

Uygulamayı bilgisayara indirip `index.html` dosyasına çift tıklayarak da kullanabilirsin. Bu durumda:

- Bilgisayardaki kopya QR kodu üretir, **telefon ise GitHub Pages'teki yayınlanmış sayfayı açar**. Telefona hiçbir şey kurmak gerekmez.
- Bunun çalışması için `app.js` dosyasının en üstündeki `PUBLIC_URL` satırına kendi GitHub Pages adresini yaz, örneğin:

  ```js
  const PUBLIC_URL = 'https://kullanici.github.io/localshare/';
  ```

- Bu ayarı GitHub'da bir kere yap (repo'da `app.js` dosyasını aç, kalem simgesine bas, satırı değiştir, **Commit changes**). Bundan sonra repo'dan indirilen her kopya hazır gelir.
- Sayfa zaten `https://...github.io/...` adresinden açılmışsa bu ayara gerek yok, QR kod otomatik doğru adresi taşır.

## Uygulama olarak yükleme

- **Windows / Mac (Chrome, Edge):** adres çubuğundaki yükle simgesine ya da sayfadaki "Uygulama olarak yükle" düğmesine bas.
- **Android (Chrome):** "Uygulama olarak yükle" düğmesi ya da menüden "Ana ekrana ekle".
- **iPhone (Safari):** Paylaş düğmesi, sonra "Ana Ekrana Ekle".

## GitHub'a yükleme (Git bilmeden)

1. https://github.com adresinde hesabına gir (yoksa ücretsiz hesap aç).
2. Sağ üstte **+** simgesi, sonra **New repository**.
3. Repository name: `localshare`. **Public** seç. **Create repository**'e bas.
4. Açılan sayfada **uploading an existing file** bağlantısına tıkla.
5. Bu klasörün **içindeki** her şeyi (`index.html`, `app.js`, `style.css`, `sw.js`, `manifest.webmanifest`, `README.md` ve üç adet `.png` ikon dosyası) tarayıcıya sürükle. Klasörün kendisini değil, içindekileri sürükle.
6. Aşağıda **Commit changes**'e bas.
7. Repo'da **Settings**, sol menüde **Pages**. "Build and deployment" altında **Source: Deploy from a branch**, **Branch: main**, klasör **/ (root)** seç ve **Save**'e bas.
8. 1-2 dakika bekle. Sayfanın üstünde `https://KULLANICI.github.io/localshare/` adresi görünür. Uygulaman bu adreste yayında.

### Git ile yüklemek istersen

```bash
cd localshare
git init
git add .
git commit -m "İlk sürüm"
git branch -M main
git remote add origin https://github.com/KULLANICI/localshare.git
git push -u origin main
```

Sonra yukarıdaki 7. adımı uygula.

## Bilgisayarında denemek

```bash
python -m http.server 8000
```

`http://localhost:8000` adresini aç. Telefonla denemek için sayfanın `https` olması gerekir (kamera bağlantısı, kopyalama ve ekranı açık tutma özellikleri için), o yüzden telefon testini GitHub Pages adresinden yap.

## Bilinen sınırlar

- Eşleşme için ücretsiz genel PeerJS sunucusu kullanılır. Sunucu yalnızca iki cihazı tanıştırır, dosyalar ona uğramaz. Ama sunucu kapalıysa eşleşme olmaz. İstersen kendi PeerJS sunucunu kurup `app.js` içindeki `new Peer(myId)` satırına ayarlarını ekleyebilirsin.
- Bazı kurumsal ağlarda ve mobil operatörlerde doğrudan bağlantı kurulamayabilir (yedek TURN sunucusu yok).
- Alınan dosya aktarım sırasında cihazın belleğinde tutulur. Fotoğraflar ve birkaç yüz MB'a kadar dosyalar rahat gider, çok büyük videolar (özellikle iPhone'da) sorun çıkarabilir.
- Aktarım sırasında sayfa açık ve ekran uyanık kalmalı. Telefonda başka uygulamaya geçersen aktarım durabilir.
- QR kodu ve kodu başkasına gösterme, bağlanan kişi sana dosya gönderebilir.

## Üçüncü taraf kütüphaneler

- [PeerJS](https://peerjs.com) (MIT)
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT)
