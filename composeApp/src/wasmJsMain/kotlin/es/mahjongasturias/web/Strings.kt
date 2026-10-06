package es.mahjongasturias.web

import kotlinx.browser.window

enum class Lang(val code: String) { ES("es"), EN("en") }

class Strings(
    val pageTitle: String,
    val logoDescription: String,
    val aboutTitle: String,
    val whatIsTitle: String,
    val whatIsText: String,
    val contactTitle: String,
    val aboutIntro: String,
    val aboutAfterMadrid: String,
    val aboutEmaPrefix: String,
    val aboutEmaLink: String,
    val aboutEmaFallbackLink: String,
    val aboutDevPrefix: String,
    val aboutDevSuffix: String,
    val contactPrefix: String,
    val contactSuffix: String,
    val switchTo: String,
    val switchToDark: String,
    val switchToLight: String,
)

val StringsEs = Strings(
    pageTitle = "Asociación de Mahjong de Asturias",
    logoDescription = "Logotipo de la Asociación de Mahjong de Asturias",
    aboutTitle = "Quiénes somos",
    whatIsTitle = "Qué es el mahjong",
    whatIsText = "El mahjong es un juego de mesa de fichas para cuatro jugadores. " +
        "Se juega con estrategia, memoria y un poco de suerte.",
    contactTitle = "Contacto",
    aboutIntro = "Hola, soy Ernesto. Nací en Madrid y fundé la asociación ",
    aboutAfterMadrid = ". Hace 5 años me mudé a Asturias. Vivo entre Gijón y Piloña.\n\n" +
        "Quiero encontrar jugadores en Asturias. Quiero jugar con vosotros y enseñar a quien " +
        "no conozca el juego. Si hay interés, en el futuro quiero organizar torneos.\n\n",
    aboutEmaPrefix = "Juego en competición europea. Puedes ver mi ",
    aboutEmaLink = "perfil en la EMA",
    aboutEmaFallbackLink = "European Mahjong Association (EMA)",
    aboutDevPrefix = ".\n\nTambién soy desarrollador. Creé ",
    aboutDevSuffix = ", una aplicación gratuita para Android que anota las puntuaciones de las partidas.",
    contactPrefix = "Escribe a ",
    contactSuffix = ". Dime si quieres jugar, aprender o ayudar a organizar partidas.",
    switchTo = "Cambiar a inglés",
    switchToDark = "Cambiar a tema oscuro",
    switchToLight = "Cambiar a tema claro",
)

val StringsEn = Strings(
    pageTitle = "Asturias Mahjong Association",
    logoDescription = "Logo of the Asturias Mahjong Association",
    aboutTitle = "About us",
    whatIsTitle = "What is mahjong",
    whatIsText = "Mahjong is a tile game for four players. " +
        "You play it with strategy, memory and a little luck.",
    contactTitle = "Contact",
    aboutIntro = "Hi, I am Ernesto. I was born in Madrid and I founded the association ",
    aboutAfterMadrid = ". Five years ago I moved to Asturias. I live between Gijón and Piloña.\n\n" +
        "I want to find players in Asturias. I want to play with you and teach people " +
        "who do not know the game. If there is interest, I want to organize tournaments in the future.\n\n",
    aboutEmaPrefix = "I play in European competition. You can see my ",
    aboutEmaLink = "EMA profile",
    aboutEmaFallbackLink = "European Mahjong Association (EMA)",
    aboutDevPrefix = ".\n\nI am also a developer. I created ",
    aboutDevSuffix = ", a free Android app that records the scores of your games.",
    contactPrefix = "Write to ",
    contactSuffix = ". Tell me if you want to play, learn or help organize games.",
    switchTo = "Switch to Spanish",
    switchToDark = "Switch to dark theme",
    switchToLight = "Switch to light theme",
)

fun Lang.strings(): Strings = if (this == Lang.ES) StringsEs else StringsEn

/** Spanish by default. English only if the browser language is English. */
fun detectLang(): Lang {
    val languages = runCatching { window.navigator.languages.toArray().map { it.toString() } }
        .getOrDefault(emptyList())
        .ifEmpty { listOf(window.navigator.language) }
    val first = languages.firstOrNull { it.startsWith("es", true) || it.startsWith("en", true) }
    return if (first != null && first.startsWith("en", true)) Lang.EN else Lang.ES
}
