# LocalShare

Telefon ile bilgisayar arasında dosya ve fotoğraf aktar. **Aynı Wi-Fi'de olmana gerek yok.** Bilgisayardaki QR kodu telefonunla okut, cihazlar doğrudan birbirine bağlansın.

- Windows, Mac, Linux, Android ve iPhone'da çalışır
- Hesap açmak ya da telefona uygulama kurmak gerekmez
- Dosyalar iki cihaz arasında doğrudan gider, hiçbir yerde saklanmaz

## Nasıl kullanılır

1. Bu sayfanın üstündeki yeşil **Code** düğmesine bas, sonra **Download ZIP**'i seç.
2. İnen zip dosyasına sağ tıkla ve **Tümünü ayıkla**'yı seç. Zip'in içinden açma, dosyalar eksik gelir ve sayfa bozuk görünür.
3. Çıkan klasörde **index.html** dosyasına çift tıkla. Tarayıcıda bir QR kod açılır.
4. Telefonunun kamerasını QR koda tut ve çıkan bağlantıya dokun. İki cihazda da sağ üstte **Bağlandı** yazınca hazırsın.
5. Telefonda ya da bilgisayarda **Dosya veya fotoğraf seç** düğmesine bas ve göndermek istediklerini seç. Bilgisayardan göndereceklerini sayfaya sürükleyip bırakabilirsin.
6. Karşı cihazda dosya listede görünür. **Kaydet**'e bas. Telefonda ayrıca **Paylaş** düğmesi çıkabilir, fotoğrafları galeriye kaydetmek için işe yarar.

QR kodu okutamıyorsan bilgisayardaki **Kod** yazısını telefonda sayfanın altındaki kutuya yazıp **Bağlan**'a bas.

## Uygulama olarak yükleme (isteğe bağlı)

Kullanmak için yüklemen gerekmez. İstersen telefonuna ya da bilgisayarına uygulama gibi ekleyebilirsin:

- **Windows / Mac (Chrome, Edge):** Adres çubuğundaki yükle simgesine ya da sayfadaki **Uygulama olarak yükle** düğmesine bas.
- **Android (Chrome):** **Uygulama olarak yükle** düğmesine bas ya da menüden **Ana ekrana ekle**'yi seç.
- **iPhone (Safari):** Paylaş düğmesine, sonra **Ana Ekrana Ekle**'ye dokun.

## Bir şey çalışmazsa

- **Sayfa düz beyaz ve çirkin görünüyor:** Zip'i ayıklamadan açmışsın. Zip'e sağ tıklayıp **Tümünü ayıkla** de, sonra ayıklanan klasörden aç.
- **Kırmızı bir uyarı çıkıyor:** Sayfanın internet adresi ayarlanmamış. Uygulamayı yayınlayan kişi **Geliştirenler için** bölümündeki adımı yapmalı.
- **Bağlanmıyor:** İki cihazın da internete bağlı olduğundan emin ol, sayfayı yenile ve QR kodu yeniden okut.
- **Bağlantı koptu:** Bilgisayardaki sayfayı yenile ve QR kodu tekrar okut.

## Bilinen sınırlar

- Eşleşme için ücretsiz genel PeerJS sunucusu kullanılır. Sunucu yalnızca iki cihazı tanıştırır, dosyalar ona uğramaz. Ama sunucu kapalıysa bağlantı kurulamaz.
- Bazı şirket ağlarında ve mobil operatörlerde doğrudan bağlantı kurulamayabilir. Yedek bir TURN sunucusu yok.
- Alınan dosya aktarım sırasında cihazın belleğinde tutulur. Fotoğraflar ve birkaç yüz MB'a kadar dosyalar rahat gider, çok büyük videolar (özellikle iPhone'da) sorun çıkarabilir.
- Aktarım sırasında sayfa açık ve ekran uyanık kalmalı. Telefonda başka uygulamaya geçersen aktarım durabilir.
- QR kodu ve kodu başkasına gösterme. Kodu bilen kişi sana dosya gönderebilir.

## Geliştirenler için

Uygulama düz HTML, CSS ve JavaScript'tir, derleme gerektirmez. Kendi kopyanı yayınlamak için:

1. Dosyaları kendi GitHub deposuna yükle ve **Settings, Pages** bölümünden `main` dalını `/ (root)` olarak yayınla.
2. `app.js` dosyasının en üstündeki `PUBLIC_URL` satırına yayın adresini yaz, örneğin `https://kullanici.github.io/localshare/`. İndirilen kopyalardaki QR kodlar telefonu bu adrese yönlendirir.

Kendi PeerJS sunucunu kullanmak istersen `app.js` içindeki `new Peer(myId)` satırına sunucu ayarlarını ekleyebilirsin.

## Üçüncü taraf kütüphaneler

- [PeerJS](https://peerjs.com) (MIT)
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT)
