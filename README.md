<p align="center">
  <img src="https://www.mahjongasturias.es/img/logo.png" alt="Asociación de Mahjong de Asturias" width="420">
</p>

# Mahjong Asturias Website

https://www.mahjongasturias.es

Website of the Asturian Mahjong Association.
Static HTML and CSS in the `site/` folder. Spanish at `/`, English at `/en/` and Asturian at `/ast/`.

## Pages

| Spanish | English | Asturian | Content |
| --- | --- | --- | --- |
| `/` | `/en/` | `/ast/` | Home |
| `/jugar/` | `/en/play/` | `/ast/xugar/` | Games, classes, demonstrations |
| `/aprender/` | `/en/learn/` | `/ast/deprender/` | Rules, MCR and Riichi, books, exercises |
| `/online/` | `/en/online/` | `/ast/en-llinia/` | Online platforms and Spanish League |
| `/federacion/` | `/en/federation/` | `/ast/federacion/` | Federation, League, clubs |
| `/contacto/` | `/en/contact/` | `/ast/contautu/` | About us, WhatsApp, Instagram, email |
| `/aprender/mcr/`, `/riichi/`, `/duplicate/` | `/en/learn/mcr/`, `/riichi/`, `/duplicate/` | `/ast/deprender/mcr/`, `/riichi/`, `/duplicate/` | One page per mode. Same sections: what it is, rules, books, videos, exercises, where to play. Linked from the Learn submenu |
| `/aprender/mesa/` | `/en/learn/table/` | `/ast/deprender/mesa/` | Practice table: drag and drop tiles with snapping. Uses `js/mesa.js` and `css/mesa.css` |

Each page is a folder with an `index.html` file. Edit the three language versions of a page together.

## Commands

- Run locally: `python3 -m http.server 8765 --directory site` and open http://localhost:8765
- Check the site: `node scripts/check-site.mjs`. It checks internal links and anchors, the sitemap, the service worker cache list, JS syntax, JSON files and basic HTML (doctype, `lang`, `<title>`, duplicate ids).
- Deploy to Firebase Hosting by hand: `firebase deploy --only hosting`

`firebase.json` publishes the `site/` folder. It does not run Gradle.

## Workflow (GitHub Actions)

`main` only takes changes through pull requests.

1. Make a branch and open a pull request to `main`.
2. **CI** (`.github/workflows/ci.yml`) runs `scripts/check-site.mjs`. The pull request can not merge until it passes.
3. **PR preview** (`.github/workflows/preview.yml`) publishes the pull request to a temporary Firebase URL and comments the link on the pull request. The link expires after 7 days.
4. Merge. **Deploy** (`.github/workflows/deploy.yml`) checks the site again and publishes it to https://www.mahjongasturias.es.

To deploy again without changes, run **Deploy to Firebase Hosting** from the Actions tab.

The deploy uses the repository secret `FIREBASE_SERVICE_ACCOUNT_WEBMAHJONGASTURIAS` (a JSON key of a Google Cloud service account with Firebase Hosting Admin access).

## Folders

- `site/` is the website that Firebase publishes.
- `composeApp/` is the old Kotlin Multiplatform (Wasm) version of the site. It does not take part in the deploy. Keep it if you want to add Wasm pages later. Build the Wasm output into a subfolder of `site/`, for example `site/app/`.

## Logo URLs

| Preview | Description and URL |
| :---: | --- |
| <img src="https://www.mahjongasturias.es/img/logo.png" width="80"> | Page logo (720x728 px, transparent background)<br>`https://www.mahjongasturias.es/img/logo.png` |
| <img src="https://www.mahjongasturias.es/og-image.png" width="120"> | Link preview image (1200x630 px, background `#FDFDFD`)<br>`https://www.mahjongasturias.es/og-image.png` |
| <img src="https://www.mahjongasturias.es/favicon.png" width="32"> | Favicon (32x32 px, transparent background)<br>`https://www.mahjongasturias.es/favicon.png` |
| <img src="https://www.mahjongasturias.es/favicon-48.png" width="48"> | Favicon (48x48 px, transparent background)<br>`https://www.mahjongasturias.es/favicon-48.png` |
| <img src="https://www.mahjongasturias.es/icon-192.png" width="48"> | App icon (192x192 px, background `#FDFDFD`)<br>`https://www.mahjongasturias.es/icon-192.png` |
| <img src="https://www.mahjongasturias.es/icon-512.png" width="48"> | App icon (512x512 px, background `#FDFDFD`)<br>`https://www.mahjongasturias.es/icon-512.png` |
| <img src="https://www.mahjongasturias.es/apple-touch-icon.png" width="48"> | Apple touch icon (180x180 px, background `#FDFDFD`)<br>`https://www.mahjongasturias.es/apple-touch-icon.png` |

The old logo URL (`/composeResources/.../logo.png`) stops working after the next deploy.

## Licenses

- **Code:** [PolyForm Noncommercial License 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/). You can not use it for commercial purposes. See `LICENSE`.
- **Text and own images on the website:** [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Give credit to Mahjong Asturias. Do not use it for commercial purposes. Share changes under the same license.
- **Fonts:** see `licenses/FONTS.txt`.
- **Logos of organizations and platforms** (`site/img/orgs`, `site/img/platforms`): they belong to their owners. They are not under these licenses.
- **Rule texts:** texts adapted from MCR, Riichi or Duplicate rules keep the license of their source.
