package es.mahjongasturias.web

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.LinkAnnotation
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextLinkStyles
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withLink
import androidx.compose.ui.unit.dp
import androidx.compose.ui.graphics.Color
import org.jetbrains.compose.resources.painterResource
import es.mahjongasturias.web.resources.Res
import es.mahjongasturias.web.resources.logo

private const val MAHJONG_MADRID_URL = "https://www.mahjongmadrid.com"
private const val MAHJONG_SCORING_URL =
    "https://play.google.com/store/apps/details?id=com.mahjongscoring.activities"
private const val EMA_URL = "https://mahjong-europe.org"

private const val EMA_PROFILE_URL = "http://mahjong-europe.org/ranking/Players/10990039.html"

private const val CONTACT_EMAIL = "mahjongasturias@gmail.com"

@Composable
fun App() {
    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = Color.White) {
            Box(
                modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()),
                contentAlignment = Alignment.TopCenter,
            ) {
                Column(
                    modifier = Modifier.widthIn(max = 720.dp).fillMaxWidth().padding(24.dp),
                    verticalArrangement = Arrangement.spacedBy(32.dp),
                ) {
                    Header()
                    Section("Quiénes somos") { AboutText() }
                    Section("Qué es el mahjong") {
                        Text(
                            "El mahjong es un juego de mesa de fichas para cuatro jugadores. " +
                                "Se juega con estrategia, memoria y un poco de suerte.",
                            style = MaterialTheme.typography.bodyLarge,
                        )
                    }
                    Section("Contacto") { ContactText() }
                }
            }
        }
    }
}

@Composable
private fun Header() {
    Column(
        modifier = Modifier.fillMaxWidth().padding(top = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Image(
            painter = painterResource(Res.drawable.logo),
            contentDescription = "Logotipo de la Asociación de Mahjong de Asturias",
            modifier = Modifier.fillMaxWidth().widthIn(max = 480.dp).aspectRatio(1f),
        )
    }
}

@Composable
private fun Section(title: String, content: @Composable () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(title, style = MaterialTheme.typography.headlineSmall)
        content()
    }
}

@Composable
private fun AboutText() {
    val linkStyles = linkStyles()
    val aboutText = buildAnnotatedString {
        append("Hola, soy Ernesto. Nací en Madrid y fundé la asociación ")
        link("Mahjong Madrid", MAHJONG_MADRID_URL, linkStyles)
        append(". Hace 5 años me mudé a Asturias. Vivo entre Gijón y Piloña.\n\n")
        append("Quiero encontrar jugadores en Asturias. Quiero jugar con vosotros y enseñar a quien ")
        append("no conozca el juego. Si hay interés, en el futuro quiero organizar torneos.\n\n")
        append("Juego en competición europea. Puedes ver mi ")
        if (EMA_PROFILE_URL.isNotBlank()) {
            link("perfil en la EMA", EMA_PROFILE_URL, linkStyles)
        } else {
            link("European Mahjong Association (EMA)", EMA_URL, linkStyles)
        }
        append(".\n\n")
        append("También soy desarrollador. Creé ")
        link("Mahjong Scoring", MAHJONG_SCORING_URL, linkStyles)
        append(", una aplicación gratuita para Android que anota las puntuaciones de las partidas.")
    }
    Text(aboutText, style = MaterialTheme.typography.bodyLarge)
}

@Composable
private fun ContactText() {
    val linkStyles = linkStyles()
    val contactText = buildAnnotatedString {
        append("Escribe a ")
        link(CONTACT_EMAIL, "mailto:$CONTACT_EMAIL", linkStyles)
        append(". Dime si quieres jugar, aprender o ayudar a organizar partidas.")
    }
    Text(contactText, style = MaterialTheme.typography.bodyLarge)
}

@Composable
private fun linkStyles() = TextLinkStyles(
    style = SpanStyle(
        color = MaterialTheme.colorScheme.primary,
        textDecoration = TextDecoration.Underline,
    ),
)

private fun AnnotatedString.Builder.link(label: String, url: String, styles: TextLinkStyles) {
    withLink(LinkAnnotation.Url(url, styles)) { append(label) }
}
