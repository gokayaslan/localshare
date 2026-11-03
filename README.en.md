[Türkçe oku](README.md)

# LocalShare

Transfer files, photos and text between your phone and your computer. **You don't need to be on the same Wi-Fi.** Scan the QR code on your computer with your phone once, and from then on the two devices connect on their own.

- Works on Windows, Mac, Linux, Android and iPhone
- No account and no app to install on your phone
- Files and text go straight from one device to the other and are never stored anywhere

## How to use

1. Click the green **Code** button at the top of this page, then choose **Download ZIP**.
2. Right-click the downloaded zip file and choose **Extract All**. Don't open the page from inside the zip: files will be missing and the page will look broken.
3. In the extracted folder, double-click **index.html**. A QR code opens in your browser.
4. Point your phone's camera at the QR code and tap the link that appears. When both devices show **Connected** in the top right, you're ready.
5. Tap **Choose files or photos** and pick what you want to send. On the computer you can also drag and drop files onto the page.
6. The file appears in the list on the other device. Tap **Save**. On a phone a **Share** button may also appear, which is handy for saving photos to your gallery.

## Pair once, connect automatically

You only need to scan the QR code **once**. The phone remembers this computer. Next time, just open LocalShare on the computer and the app on your phone, and the two connect by themselves.

- On the computer, always open it from the same browser and the same folder or address. Opening it from somewhere else can reset the pairing.
- On the phone, always open the app from the same place. The app opened in the browser and the one opened from the home screen work separately.
- If you lose your phone or a picture of the QR code gets to someone else, press **Reset pairing** on the computer and all old pairings stop working.
- The app must be open on the phone to connect. Browsers can't connect in the background.

## Sending text and the clipboard

- **Send text:** Type or paste into the box and send. It shows up in the list on the computer, and **Copy** puts it on the clipboard. Links also get an **Open** button.
- **Send clipboard:** Sends whatever you copied on your phone to the computer with one tap. The browser may ask for clipboard permission the first time.
- On the computer there are **Copy incoming text automatically** and **Turn on notifications** options.

## Sending from the Share menu

**Android:** After adding the app to your home screen, press **Share** in the gallery, a browser or any app and choose **LocalShare**. Photos, files, text and links go to the computer. If LocalShare doesn't appear in the menu, remove the app and add it to the home screen again.

**iPhone:** LocalShare doesn't appear in Safari's Share menu. Instead you can build a shortcut in the Shortcuts app that uses **Open URL** with `https://gokayaslan.github.io/localshare/?text=` followed by the text you share. For photos and files on iPhone, pick them from inside the app.

## Adding to the iPhone home screen

1. Open the app's address in Safari, tap **Share**, then **Add to Home Screen**.
2. The home screen icon works separately from Safari, so you need to pair it again. On the computer, press **Copy link**, send the link to your phone and copy it.
3. Open the LocalShare icon on the home screen and tap **Pair with the link on the clipboard**.
4. From then on, always open the app from the home screen.

## Installing it as an app (optional)

You don't need to install anything to use it. If you like, you can add it to your phone or computer like an app:

- **Windows / Mac (Chrome, Edge):** Click the install icon in the address bar, or the **Install as app** button on the page.
- **Android (Chrome):** Tap the **Install as app** button, or choose **Add to Home screen** from the menu.
- **iPhone (Safari):** Tap the Share button, then **Add to Home Screen**.

## If something doesn't work

- **The page looks plain white and unstyled:** You opened it without extracting the zip. Right-click the zip, choose **Extract All**, then open the page from the extracted folder.
- **A red warning appears:** The page's web address hasn't been set. Whoever published the app needs to set `PUBLIC_URL` at the top of `app.js` to the app's web address.
- **The phone doesn't connect by itself:** Is the page open on the computer, and did you open the app on the phone from the same place you paired it? If not, press **Reset pairing** on the computer and scan the QR code again.
- **The connection dropped:** Refresh the page on the computer. The phone retries on its own.

## Known limitations

- Pairing uses the free public PeerJS server. It only introduces the two devices to each other and your files never pass through it, but if that server is down, devices can't connect.
- Some company networks and mobile carriers block direct connections. There is no TURN fallback server.
- A received file is held in the device's memory during the transfer. Photos and files up to a few hundred MB are fine, but very large videos (especially on iPhone) may cause problems.
- Keep the app open and the screen awake during a transfer. If you switch to another app on your phone, the transfer may stop.
- Sending files from the Share menu works on Android only.
- Don't show the QR code to other people. Anyone who scans it can send you files and text.

## Third-party libraries

- [PeerJS](https://peerjs.com) (MIT)
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT)
