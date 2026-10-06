<p align="center">
  <img src="https://www.mahjongasturias.es/composeResources/es.mahjongasturias.web.resources/drawable/logo.png" alt="Asociación de Mahjong de Asturias" width="420">
</p>

# Mahjong Asturias Website

https://www.mahjongasturias.es

Website of the Asturian Mahjong Association. 
Made in Kotlin Multiplatform with Compose, target Wasm only.

## Commands

- Run in development: `./gradlew :composeApp:wasmJsBrowserDevelopmentRun`
- Build for production: `./gradlew :composeApp:wasmJsBrowserDistribution`
- Deploy to Firebase Hosting: `firebase deploy --only hosting`

The production build goes to `composeApp/build/dist/wasmJs/productionExecutable`.

## Logo URLs

| Preview | Description and URL |
| :---: | --- |
| <img src="https://www.mahjongasturias.es/composeResources/es.mahjongasturias.web.resources/drawable/logo.png" width="80"> | Page logo (720x728 px, transparent background)<br>`https://www.mahjongasturias.es/composeResources/es.mahjongasturias.web.resources/drawable/logo.png` |
| <img src="https://www.mahjongasturias.es/og-image.png" width="120"> | Link preview image (1200x630 px, background `#FDFDFD`)<br>`https://www.mahjongasturias.es/og-image.png` |
| <img src="https://www.mahjongasturias.es/favicon.png" width="32"> | Favicon (32x32 px, transparent background)<br>`https://www.mahjongasturias.es/favicon.png` |
| <img src="https://www.mahjongasturias.es/favicon-48.png" width="48"> | Favicon (48x48 px, transparent background)<br>`https://www.mahjongasturias.es/favicon-48.png` |
| <img src="https://www.mahjongasturias.es/icon-192.png" width="48"> | App icon (192x192 px, background `#FDFDFD`)<br>`https://www.mahjongasturias.es/icon-192.png` |
| <img src="https://www.mahjongasturias.es/icon-512.png" width="48"> | App icon (512x512 px, background `#FDFDFD`)<br>`https://www.mahjongasturias.es/icon-512.png` |
| <img src="https://www.mahjongasturias.es/apple-touch-icon.png" width="48"> | Apple touch icon (180x180 px, background `#FDFDFD`)<br>`https://www.mahjongasturias.es/apple-touch-icon.png` |

Compose generates the page logo path. It can change if the package name or the build changes.
