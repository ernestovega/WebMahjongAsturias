package es.mahjongasturias.web

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.StrokeCap
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin
import androidx.compose.foundation.Image
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import kotlinx.browser.document
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
import es.mahjongasturias.web.resources.gang_of_three
import es.mahjongasturias.web.resources.crimson_text_regular
import es.mahjongasturias.web.resources.crimson_text_bold
import org.jetbrains.compose.resources.Font
import androidx.compose.material3.Typography
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

private const val MAHJONG_MADRID_URL = "https://www.mahjongmadrid.com"
private const val MAHJONG_SCORING_URL =
    "https://play.google.com/store/apps/details?id=com.mahjongscoring.activities"
private const val EMA_URL = "https://mahjong-europe.org"

private const val EMA_PROFILE_URL = "http://mahjong-europe.org/ranking/Players/10990039.html"

/** Edge color of logo.png (most common pixel value). Keeps the logo border invisible in light mode. */
private val LogoWhite = Color(0xFFFDFDFD)

private const val CONTACT_EMAIL = "mahjongasturias@gmail.com"

@Composable
fun App() {
    var lang by remember { mutableStateOf(detectLang()) }
    val t = lang.strings()
    val systemDark = isSystemInDarkTheme()
    var darkOverride by remember { mutableStateOf<Boolean?>(null) }
    val dark = darkOverride ?: systemDark
    LaunchedEffect(lang) {
        document.documentElement?.setAttribute("lang", lang.code)
        document.title = t.pageTitle
    }
    val titleFont = FontFamily(Font(Res.font.gang_of_three))
    val bodyFont = FontFamily(
        Font(Res.font.crimson_text_regular, FontWeight.Normal),
        Font(Res.font.crimson_text_bold, FontWeight.Bold),
    )
    MaterialTheme(
        colorScheme = if (dark) darkColorScheme() else lightColorScheme(),
        typography = mahjongTypography(titleFont, bodyFont),
    ) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = if (dark) Color(0xFF121212) else LogoWhite,
            contentColor = MaterialTheme.colorScheme.onSurface,
        ) {
            Box(modifier = Modifier.fillMaxSize()) {
                Box(
                    modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()),
                    contentAlignment = Alignment.TopCenter,
                ) {
                    Column(
                        modifier = Modifier.widthIn(max = 720.dp).fillMaxWidth().padding(horizontal = 24.dp, vertical = 48.dp),
                        verticalArrangement = Arrangement.spacedBy(48.dp),
                    ) {
                        Header(t)
                        Section(t.aboutTitle) { AboutText(t) }
                        Section(t.whatIsTitle) {
                            Text(t.whatIsText, style = MaterialTheme.typography.bodyLarge)
                        }
                        Section(t.contactTitle) { ContactText(t) }
                    }
                }
                Row(
                    modifier = Modifier.align(Alignment.TopEnd).padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(24.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    ThemeSwitch(
                        dark = dark,
                        description = if (dark) t.switchToLight else t.switchToDark,
                        onToggle = { darkOverride = !dark },
                    )
                    LanguageSwitch(
                        lang = lang,
                        description = t.switchTo,
                        onToggle = { lang = if (lang == Lang.ES) Lang.EN else Lang.ES },
                    )
                }
            }
        }
    }
}

/** Shows the flag of the language the user can switch to. */
@Composable
private fun LanguageSwitch(
    lang: Lang,
    description: String,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .size(width = 36.dp, height = 24.dp)
            .clip(RoundedCornerShape(3.dp))
            .border(1.dp, Color(0x33000000), RoundedCornerShape(3.dp))
            .semantics { contentDescription = description }
            .clickable(onClick = onToggle),
    ) {
        Canvas(Modifier.fillMaxSize()) {
            if (lang == Lang.ES) drawUkFlag() else drawSpainFlag()
        }
    }
}

/** Shows the icon of the theme the user can switch to: a sun in dark mode, a moon in light mode. */
@Composable
private fun ThemeSwitch(dark: Boolean, description: String, onToggle: () -> Unit) {
    val iconColor = MaterialTheme.colorScheme.onSurface
    val background = if (dark) Color(0xFF121212) else LogoWhite
    Box(
        modifier = Modifier
            .size(24.dp)
            .clip(CircleShape)
            .semantics { contentDescription = description }
            .clickable(onClick = onToggle),
    ) {
        Canvas(Modifier.fillMaxSize()) {
            val c = center
            if (dark) {
                drawCircle(iconColor, radius = size.minDimension * 0.22f, center = c)
                for (i in 0 until 8) {
                    val a = i * PI / 4
                    val dir = Offset(cos(a).toFloat(), sin(a).toFloat())
                    drawLine(
                        iconColor,
                        c + dir * (size.minDimension * 0.34f),
                        c + dir * (size.minDimension * 0.48f),
                        strokeWidth = size.minDimension * 0.07f,
                        cap = StrokeCap.Round,
                    )
                }
            } else {
                drawCircle(iconColor, radius = size.minDimension * 0.42f, center = c)
                drawCircle(
                    background,
                    radius = size.minDimension * 0.36f,
                    center = c + Offset(size.minDimension * 0.22f, -size.minDimension * 0.12f),
                )
            }
        }
    }
}

private fun DrawScope.drawSpainFlag() {
    val red = Color(0xFFAA151B)
    val yellow = Color(0xFFF1BF00)
    val h = size.height
    drawRect(red, size = Size(size.width, h))
    drawRect(yellow, topLeft = Offset(0f, h * 0.25f), size = Size(size.width, h * 0.5f))
}

private fun DrawScope.drawUkFlag() {
    val blue = Color(0xFF012169)
    val red = Color(0xFFC8102E)
    val w = size.width
    val h = size.height
    val tl = Offset(0f, 0f)
    val tr = Offset(w, 0f)
    val bl = Offset(0f, h)
    val br = Offset(w, h)
    drawRect(blue, size = size)
    drawLine(Color.White, tl, br, strokeWidth = h * 0.22f)
    drawLine(Color.White, tr, bl, strokeWidth = h * 0.22f)
    drawLine(red, tl, br, strokeWidth = h * 0.08f)
    drawLine(red, tr, bl, strokeWidth = h * 0.08f)
    drawRect(Color.White, Offset(w * 0.5f - h * 0.2f, 0f), Size(h * 0.4f, h))
    drawRect(Color.White, Offset(0f, h * 0.5f - h * 0.2f), Size(w, h * 0.4f))
    drawRect(red, Offset(w * 0.5f - h * 0.12f, 0f), Size(h * 0.24f, h))
    drawRect(red, Offset(0f, h * 0.5f - h * 0.12f), Size(w, h * 0.24f))
}

@Composable
private fun Header(t: Strings) {
    Column(
        modifier = Modifier.fillMaxWidth().padding(top = 32.dp, bottom = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Image(
            painter = painterResource(Res.drawable.logo),
            contentDescription = t.logoDescription,
            modifier = Modifier.fillMaxWidth().widthIn(max = 480.dp).aspectRatio(1f)
                .clip(RoundedCornerShape(16.dp)),
        )
    }
}

@Composable
private fun Section(title: String, content: @Composable () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text(title, style = MaterialTheme.typography.headlineMedium)
        content()
    }
}

@Composable
private fun AboutText(t: Strings) {
    val linkStyles = linkStyles()
    val aboutText = buildAnnotatedString {
        append(t.aboutIntro)
        link("Mahjong Madrid", MAHJONG_MADRID_URL, linkStyles)
        append(t.aboutAfterMadrid)
        append(t.aboutEmaPrefix)
        if (EMA_PROFILE_URL.isNotBlank()) {
            link(t.aboutEmaLink, EMA_PROFILE_URL, linkStyles)
        } else {
            link(t.aboutEmaFallbackLink, EMA_URL, linkStyles)
        }
        append(t.aboutDevPrefix)
        link("Mahjong Scoring", MAHJONG_SCORING_URL, linkStyles)
        append(t.aboutDevSuffix)
    }
    Text(aboutText, style = MaterialTheme.typography.bodyLarge)
}

@Composable
private fun ContactText(t: Strings) {
    val linkStyles = linkStyles()
    val contactText = buildAnnotatedString {
        append(t.contactPrefix)
        link(CONTACT_EMAIL, "mailto:$CONTACT_EMAIL", linkStyles)
        append(t.contactSuffix)
    }
    Text(contactText, style = MaterialTheme.typography.bodyLarge)
}

private fun mahjongTypography(titleFont: FontFamily, bodyFont: FontFamily): Typography {
    val base = Typography()
    return base.copy(
        headlineMedium = base.headlineMedium.copy(
            fontFamily = titleFont,
            fontWeight = FontWeight.Normal,
            fontSize = 34.sp,
            lineHeight = 42.sp,
            letterSpacing = 1.sp,
        ),
        bodyLarge = base.bodyLarge.copy(
            fontFamily = bodyFont,
            fontSize = 21.sp,
            lineHeight = 32.sp,
            letterSpacing = 0.2.sp,
        ),
    )
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
