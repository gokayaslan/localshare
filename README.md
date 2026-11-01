# LocalShare

Telefon ile bilgisayar arasında dosya ve fotoğraf aktar. **Aynı Wi-Fi'de olmana gerek yok.** Bilgisayardaki QR kodu telefonla okut, cihazlar doğrudan birbirine bağlansın.

- Windows, macOS, Linux, Android ve iPhone'da çalışır (web uygulaması / PWA)
- Hesap, kurulum ya da sunucu gerekmez
- Dosyalar iki cihaz arasında doğrudan (WebRTC) gider, hiçbir yerde saklanmaz

## Nasıl kullanılır

1. Bilgisayarda uygulamanın adresini aç (aşağıdaki "GitHub'a yükleme" adımlarından sonra `(https://gokayaslan.github.io/localshare/)` gibi bir adresin olacak).
2. Ekranda QR kod çıkar. Telefonun kamerasıyla okut, açılan bağlantıya dokun.
3. İki cihaz bağlanınca "Bağlandı" yazar. İki yönde de "Dosya veya fotoğraf seç" ile gönderebilirsin.
4. Gelen dosyada **Kaydet** (ya da telefonda **Paylaş**) düğmesine bas.

QR okutamıyorsan: bilgisayardaki "Kod" yazısını telefonda sayfanın altındaki kutuya yaz.

## İndirilen kopyayı kullanma (zip / Download ZIP)

Uygulamayı (zip'i bilgisayara indirdikten sonra zip dosyasından çıkartalım. Bilgisayara indirip `index.html` dosyasına çift tıklayarak da kullanabilirsin. Bu durumda:

- Bilgisayardaki kopya QR kodu üretir, **telefon ise GitHub Pages'teki yayınlanmış sayfayı açar**. Telefona hiçbir şey kurmak gerekmez.


## Uygulama olarak yükleme

- **Windows / Mac (Chrome, Edge):** adres çubuğundaki yükle simgesine ya da sayfadaki "Uygulama olarak yükle" düğmesine bas.
- **Android (Chrome):** "Uygulama olarak yükle" düğmesi ya da menüden "Ana ekrana ekle".
- **iPhone (Safari):** Paylaş düğmesi, sonra "Ana Ekrana Ekle".



## Bilinen sınırlar

- Eşleşme için ücretsiz genel PeerJS sunucusu kullanılır. Sunucu yalnızca iki cihazı tanıştırır, dosyalar ona uğramaz. Ama sunucu kapalıysa eşleşme olmaz. İstersen kendi PeerJS sunucunu kurup `app.js` içindeki `new Peer(myId)` satırına ayarlarını ekleyebilirsin.
- Bazı kurumsal ağlarda ve mobil operatörlerde doğrudan bağlantı kurulamayabilir (yedek TURN sunucusu yok).
- Alınan dosya aktarım sırasında cihazın belleğinde tutulur. Fotoğraflar ve birkaç yüz MB'a kadar dosyalar rahat gider, çok büyük videolar (özellikle iPhone'da) sorun çıkarabilir.
- Aktarım sırasında sayfa açık ve ekran uyanık kalmalı. Telefonda başka uygulamaya geçersen aktarım durabilir.
- QR kodu ve kodu başkasına gösterme, bağlanan kişi sana dosya gönderebilir.

## Üçüncü taraf kütüphaneler

- [PeerJS](https://peerjs.com) (MIT)
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT)
