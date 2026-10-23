# ZapGO

Automatic message signature, quick formatting and a privacy blur for **WhatsApp Web**.

ZapGO is a browser extension for people who answer customers or chat a lot on WhatsApp Web. It types your name before each conversation for you, applies WhatsApp formatting with one click, and hides names, photos and media when someone might be looking at your screen.

**Install**

- [Chrome Web Store](https://chromewebstore.google.com/detail/zapgo/heglkecjcmlgcnakdadgabobchkfajno)
- [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/zapgo/ckkabfpjbpmlbpffdbfhfaldddfkakgc)

> ZapGO is an independent project. It is not affiliated with, endorsed by or sponsored by WhatsApp or Meta.

## Features

- **Automatic signature.** Your name is added to the first message of a conversation. A live preview in the popup shows how it will look in WhatsApp.
- **Quick formatting.** Bold, italic, monospace, code block and quote, plus an option to put the signature on its own line or capitalize the first letter. Pasted text also gets the signature.
- **Privacy mode.** Blurs profile photos, contact names, message previews and media. Each part can be switched on or off, and hovering reveals the item. A master switch pauses everything.
- **Local settings.** Preferences are saved with the browser's `chrome.storage.sync`, so they follow you between your own devices.

## How it works

- Manifest V3 extension written in plain JavaScript, HTML and CSS, with no build step and no dependencies.
- A content script runs on `https://web.whatsapp.com/*`. It uses event delegation on the message box (`keydown`, `input`, `click` and `paste`) and detects the first character of a message to insert the signature through a synthetic paste event.
- Privacy blur is pure CSS: the script toggles classes on `<body>` and a single injected stylesheet does the rest.
- The popup (`popup.html`, `popup.js`, `popup.css`) edits the settings and renders the preview.

## Privacy

ZapGO does not collect or send your data. The extension code makes no network requests; the popup only loads the Outfit font from Google Fonts. Settings are stored by the browser through `chrome.storage.sync`.

## Run from source

1. Download or clone this repository.
2. Open `chrome://extensions` (or `edge://extensions`) and turn on **Developer mode**.
3. Click **Load unpacked** and select this folder.
4. Open [WhatsApp Web](https://web.whatsapp.com/) and click the ZapGO icon to configure it.

## Project files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (Manifest V3, `storage` permission only) |
| `content.js` | Signature, formatting and privacy logic on WhatsApp Web |
| `popup.html`, `popup.js`, `popup.css` | Settings popup and live preview |
| `icon16.png`, `icon48.png`, `icon128.png` | Extension icons |

## Author

Vitor Giovani Fiorin, [LinkedIn](https://www.linkedin.com/in/vitor-fiorin-1424061a2).

## License

MIT, see [LICENSE](LICENSE).
