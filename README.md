# Mahjong Asturias Website

Website of the Asturian Mahjong Association. 
Made in Kotlin Multiplatform with Compose, target Wasm only.

## Commands

- Run in development: `./gradlew :composeApp:wasmJsBrowserDevelopmentRun`
- Build for production: `./gradlew :composeApp:wasmJsBrowserDistribution`
- Deploy to Firebase Hosting: `firebase deploy --only hosting`

The production build goes to `composeApp/build/dist/wasmJs/productionExecutable`.
