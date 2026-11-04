[Read in English](README.en.md)

# LocalShare

Telefon ile bilgisayar arasında dosya, fotoğraf ve metin aktar. **Aynı Wi-Fi'de olmana gerek yok.** Bilgisayardaki QR kodu telefonunla bir kez okut, sonrasında cihazlar kendiliğinden bağlansın.

- Windows, Mac, Linux, Android ve iPhone'da çalışır
- Hesap açmak ya da telefona uygulama kurmak gerekmez
- Dosyalar ve metinler iki cihaz arasında doğrudan gider, hiçbir yerde saklanmaz

## Nasıl kullanılır

1. Bu sayfanın üstündeki yeşil **Code** düğmesine bas, sonra **Download ZIP**'i seç.
2. İnen zip dosyasına sağ tıkla ve **Tümünü ayıkla**'yı seç. Zip'in içinden açma, dosyalar eksik gelir ve sayfa bozuk görünür.
3. Çıkan klasörde **index.html** dosyasına çift tıkla. Tarayıcıda bir QR kod açılır.
4. Telefonunun kamerasını QR koda tut ve çıkan bağlantıya dokun. İki cihazda da sağ üstte **Bağlandı** yazınca hazırsın.
5. **Dosya veya fotoğraf seç** düğmesine bas ve göndermek istediklerini seç. Bilgisayardan göndereceklerini sayfaya sürükleyip bırakabilirsin.
6. Karşı cihazda dosya listede görünür. **Kaydet**'e bas. Telefonda ayrıca **Paylaş** düğmesi çıkabilir, fotoğrafları galeriye kaydetmek için işe yarar.

## Bir kez eşleş, sonra otomatik bağlan

QR kodu telefonla **yalnızca bir kez** okutman yeterli. Telefon bu bilgisayarı hatırlar. Sonraki seferlerde bilgisayarda LocalShare'i, telefonda da uygulamayı açman yeterli, ikisi kendiliğinden bağlanır.

- Bilgisayarda hep aynı tarayıcıdan ve aynı klasörden ya da adresten aç. Farklı bir yerden açarsan eşleşme sıfırlanabilir.
- Telefonda uygulamayı hep aynı yerden aç. Tarayıcıdan ve ana ekrandan açılan uygulama birbirinden ayrı çalışır.
- Telefon kaybolursa ya da QR kodunun görüntüsü başkasına geçerse bilgisayardaki **Eşleşmeyi sıfırla** düğmesine bas, eski eşleşmeler geçersiz olur.
- Telefonun bağlanabilmesi için uygulamanın açık olması gerekir. Tarayıcılar arka planda bağlantı kuramaz.

## Metin ve pano gönderme

- **Metni gönder:** Kutuya yaz ya da yapıştır ve gönder. Bilgisayarda listede çıkar, **Kopyala** ile panoya alırsın. Bağlantıysa **Aç** düğmesi de çıkar.
- **Panoyu gönder:** Telefonda kopyaladığın şeyi tek dokunuşla bilgisayara yollar. Tarayıcı ilk seferde pano izni isteyebilir.
- Bilgisayarda **Gelen metni otomatik kopyala** ve **Bildirimleri aç** seçenekleri var.

## Paylaş menüsünden gönderme

**Android:** Uygulamayı ana ekrana ekledikten sonra galeride, tarayıcıda ya da herhangi bir uygulamada **Paylaş**'a bas ve **LocalShare**'i seç. Fotoğraf, dosya, metin ve bağlantılar bilgisayara gider. Menüde LocalShare görünmüyorsa uygulamayı silip yeniden ana ekrana ekle.

**iPhone:** Safari Paylaş menüsünde LocalShare görünmez. Bunun yerine Kısayollar uygulamasında **URL'yi aç** eylemiyle `https://gokayaslan.github.io/localshare/?text=` adresinin sonuna paylaştığın metni ekleyen bir kısayol yapabilirsin. Fotoğraf ve dosyaları iPhone'da uygulamanın içinden seçerek gönder.

## iPhone'da ana ekrana ekleme

1. Safari'de uygulamanın adresini aç, **Paylaş**'a, sonra **Ana Ekrana Ekle**'ye dokun.
2. Ana ekrandaki simge Safari'den ayrı çalıştığı için QR'ı yeniden okutman gerekmez. Bilgisayarda **Bağlantıyı kopyala**'ya bas, bağlantıyı telefona gönder ve kopyala.
3. Ana ekrandaki LocalShare simgesini aç ve **Panodaki bağlantıyla eşleş** düğmesine bas.
4. Bundan sonra uygulamayı hep ana ekrandan aç.

## Uygulama olarak yükleme (isteğe bağlı)

Kullanmak için yüklemen gerekmez. İstersen telefonuna ya da bilgisayarına uygulama gibi ekleyebilirsin:

- **Windows / Mac (Chrome, Edge):** Adres çubuğundaki yükle simgesine ya da sayfadaki **Uygulama olarak yükle** düğmesine bas.
- **Android (Chrome):** **Uygulama olarak yükle** düğmesine bas ya da menüden **Ana ekrana ekle**'yi seç.
- **iPhone (Safari):** Paylaş düğmesine, sonra **Ana Ekrana Ekle**'ye dokun.

## Bir şey çalışmazsa

- **Sayfa düz beyaz ve çirkin görünüyor:** Zip'i ayıklamadan açmışsın. Zip'e sağ tıklayıp **Tümünü ayıkla** de, sonra ayıklanan klasörden aç.
- **Kırmızı bir uyarı çıkıyor:** Sayfanın internet adresi ayarlanmamış. Uygulamayı yayınlayan kişi `app.js` dosyasının en üstündeki `PUBLIC_URL` satırına uygulamanın internet adresini yazmalı.
- **Telefon kendiliğinden bağlanmıyor:** Bilgisayardaki sayfa açık mı, telefonda uygulamayı eşleştirdiğin yerden mi açtın? Olmazsa bilgisayarda **Eşleşmeyi sıfırla**'ya basıp QR'ı yeniden okut.
- **Bağlantı koptu:** Bilgisayardaki sayfayı yenile. Telefon kendiliğinden yeniden dener.

## Bilinen sınırlar

- Eşleşme için ücretsiz genel PeerJS sunucusu kullanılır. Sunucu yalnızca iki cihazı tanıştırır, dosyalar ona uğramaz. Ama sunucu kapalıysa bağlantı kurulamaz.
- Bazı şirket ağlarında ve mobil operatörlerde doğrudan bağlantı kurulamayabilir. Yedek bir TURN sunucusu yok.
- Alınan dosya aktarım sırasında cihazın belleğinde tutulur. Fotoğraflar ve birkaç yüz MB'a kadar dosyalar rahat gider, çok büyük videolar (özellikle iPhone'da) sorun çıkarabilir.
- Aktarım sırasında uygulama açık ve ekran uyanık kalmalı. Telefonda başka uygulamaya geçersen aktarım durabilir.
- Paylaş menüsüyle dosya gönderme yalnızca Android'de çalışır.
- QR kodu başkasına gösterme. Kodu okutan kişi sana dosya ve metin gönderebilir.

## Üçüncü taraf kütüphaneler

- [PeerJS](https://peerjs.com) (MIT)
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT)

---

© 2027 Gökay Aslan. Tüm hakları saklıdır.
