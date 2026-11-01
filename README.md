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
- **Bağlantı koptu:** Bilgisayardaki sayfayı yenile ve QR kodu tekrar okut.

## Bilinen sınırlar

- Eşleşme için ücretsiz genel PeerJS sunucusu kullanılır. Sunucu yalnızca iki cihazı tanıştırır, dosyalar ona uğramaz. Ama sunucu kapalıysa bağlantı kurulamaz.
- Bazı şirket ağlarında ve mobil operatörlerde doğrudan bağlantı kurulamayabilir. Yedek bir TURN sunucusu yok.
- Alınan dosya aktarım sırasında cihazın belleğinde tutulur. Fotoğraflar ve birkaç yüz MB'a kadar dosyalar rahat gider, çok büyük videolar (özellikle iPhone'da) sorun çıkarabilir.
- Aktarım sırasında sayfa açık ve ekran uyanık kalmalı. Telefonda başka uygulamaya geçersen aktarım durabilir.
- QR kodu ve kodu başkasına gösterme. Kodu bilen kişi sana dosya gönderebilir.


## Üçüncü taraf kütüphaneler

- [PeerJS](https://peerjs.com) (MIT)
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT)


# LocalShare

Transfer files and photos between your phone and your computer. **You don't need to be on the same Wi-Fi.** Scan the QR code on your computer with your phone and the two devices connect directly.

- Works on Windows, Mac, Linux, Android and iPhone
- No account and no app to install on your phone
- Files go straight from one device to the other and are never stored anywhere

## How to use

1. Click the green **Code** button at the top of this page, then choose **Download ZIP**.
2. Right-click the downloaded zip file and choose **Extract All**. Don't open the page from inside the zip: files will be missing and the page will look broken.
3. In the extracted folder, double-click **index.html**. A QR code opens in your browser.
4. Point your phone's camera at the QR code and tap the link that appears. When both devices show **Connected** in the top right, you're ready.
5. On your phone or your computer, tap **Choose files or photos** and pick what you want to send. On the computer you can also drag and drop files onto the page.
6. The file appears in the list on the other device. Tap **Save**. On a phone a **Share** button may also appear, which is handy for saving photos to your gallery.

If you can't scan the QR code, type the **Code** shown on the computer into the box at the bottom of the page on your phone and tap **Connect**.

## Installing it as an app (optional)

You don't need to install anything to use it. If you like, you can add it to your phone or computer like an app:

- **Windows / Mac (Chrome, Edge):** Click the install icon in the address bar, or the **Install as app** button on the page.
- **Android (Chrome):** Tap the **Install as app** button, or choose **Add to Home screen** from the menu.
- **iPhone (Safari):** Tap the Share button, then **Add to Home Screen**.

## If something doesn't work

- **The page looks plain white and unstyled:** You opened it without extracting the zip. Right-click the zip, choose **Extract All**, then open the page from the extracted folder.
- **A red warning appears:** The page's web address hasn't been set. Whoever published the app needs to set `PUBLIC_URL` at the top of `app.js` to the app's web address.
- **The connection dropped:** Refresh the page on the computer and scan the QR code again.

## Known limitations

- Pairing uses the free public PeerJS server. It only introduces the two devices to each other and your files never pass through it, but if that server is down, devices can't connect.
- Some company networks and mobile carriers block direct connections. There is no TURN fallback server.
- A received file is held in the device's memory during the transfer. Photos and files up to a few hundred MB are fine, but very large videos (especially on iPhone) may cause problems.
- Keep the page open and the screen awake during a transfer. If you switch to another app on your phone, the transfer may stop.
- Don't show the QR code or the code to other people. Anyone who has the code can send you files.

## Third-party libraries

- [PeerJS](https://peerjs.com) (MIT)
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT)

