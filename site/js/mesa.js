(function () {
  var table = document.getElementById("table");
  if (!table) return;

  var R = "#c0392b", G = "#1e7a46", B = "#1f4e9c", INK = "#1a2a4a";
  var FONT = "'Noto Serif SC','Songti SC','STSong','Hiragino Mincho ProN','Yu Mincho','SimSun','Noto Serif CJK SC',serif";
  var RATIO = 1.3;

  // ---------- Tile faces (SVG, viewBox 60 x 80) ----------

  function text(ch, x, y, size, color) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" fill="' + color +
      '" text-anchor="middle" font-family="' + FONT + '" font-weight="700">' + ch + "</text>";
  }

  function dot(x, y, r, color) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + color + '"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.62) + '" fill="#f6f1e0"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.34) + '" fill="' + color + '"/>';
  }

  var DOT_R = 8.8; // same radius on the circle tiles 4 to 9
  var DOT_R_TWO = 12.5; // the 2 has the most room
  var DOT_R_FEW = 10.5; // bigger circles on the 2 and the 3, which have room (the 1 is a special big circle)

  var DOTS = {
    2: [[30, 23, G], [30, 57, B]],
    3: [[15.6, 20.8, B], [30, 40, R], [44.4, 59.2, G]], // on the diagonal of the tile (3:4)
    4: [[19, 22, B], [41, 22, G], [19, 58, G], [41, 58, B]],
    5: [[19, 22, B], [41, 22, G], [30, 40, R], [19, 58, G], [41, 58, B]],
    6: [[19, 17, G], [41, 17, G], [19, 40, R], [41, 40, R], [19, 63, R], [41, 63, R]],
    7: [[13.5, 12, G], [30, 21.5, G], [46.5, 31, G], [19, 50.5, R], [41, 50.5, R], [19, 69.5, R], [41, 69.5, R]],
    8: [[19, 11.5, B], [41, 11.5, B], [19, 30.5, B], [41, 30.5, B],
        [19, 49.5, B], [41, 49.5, B], [19, 68.5, B], [41, 68.5, B]],
    9: [[11.5, 20, G], [30, 20, G], [48.5, 20, G], [11.5, 41, R], [30, 41, R], [48.5, 41, R],
        [11.5, 62, B], [30, 62, B], [48.5, 62, B]]
  };

  function dotsFace(n, red) {
    if (n === 1) {
      return '<circle cx="30" cy="40" r="22" fill="' + G + '"/>' +
        '<circle cx="30" cy="40" r="16" fill="#f6f1e0"/>' +
        '<circle cx="30" cy="40" r="11" fill="' + R + '"/>' +
        '<circle cx="30" cy="40" r="5" fill="#f6f1e0"/>';
    }
    var r = n === 2 ? DOT_R_TWO : n === 3 ? DOT_R_FEW : DOT_R;
    return DOTS[n].map(function (d) { return dot(d[0], d[1], r, red ? R : d[2]); }).join("");
  }

  var BAM_DARK = "#0b2b17";

  // One bamboo segment from (x1,y1) to (x2,y2) with joints, a highlight and round ends.
  function seg(x1, y1, x2, y2, w, color, joints) {
    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.hypot(dx, dy);
    var rot = Math.atan2(dy, dx) * 180 / Math.PI - 90;
    var cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
    var out = '<g transform="translate(' + cx + " " + cy + ") rotate(" + rot.toFixed(1) + ')">' +
      '<rect x="' + (-w / 2) + '" y="' + (-len / 2 - w * 0.25) + '" width="' + w + '" height="' + (len + w * 0.5) +
      '" rx="' + (w * 0.4) + '" fill="' + color + '"/>' +
      '<rect x="' + (-w / 2 + w * 0.2) + '" y="' + (-len / 2 + w * 0.3) + '" width="' + (w * 0.2) + '" height="' + (len - w * 0.6) +
      '" rx="' + (w * 0.1) + '" fill="#fff" opacity=".4"/>';
    for (var k = 1; k <= joints; k++) {
      var y = -len / 2 + len * k / (joints + 1);
      out += '<rect x="' + (-w / 2 - 0.9) + '" y="' + (y - 1.1) + '" width="' + (w + 1.8) + '" height="2.2" rx="1" fill="' + color + '"/>' +
        '<rect x="' + (-w / 2 - 0.9) + '" y="' + (y - 1.1) + '" width="' + (w + 1.8) + '" height="2.2" rx="1" fill="' + BAM_DARK + '" opacity=".5"/>';
    }
    return out + "</g>";
  }

  var STICKS = {
    2: [[30, 22, G], [30, 58, B]],
    3: [[30, 22, G], [19, 58, B], [41, 58, B]],
    4: [[19, 22, G], [41, 22, G], [19, 58, B], [41, 58, B]],
    5: [[19, 22, G], [41, 22, G], [30, 40, R], [19, 58, G], [41, 58, G]],
    6: [[19, 16, G], [41, 16, G], [19, 40, G], [41, 40, G], [19, 64, G], [41, 64, G]],
    7: [[30, 14, R], [14, 40, G], [30, 40, G], [46, 40, G], [14, 66, G], [30, 66, G], [46, 66, G]],
    9: [[14, 16, G], [30, 16, G], [46, 16, G], [14, 40, R], [30, 40, R], [46, 40, R],
        [14, 64, B], [30, 64, B], [46, 64, B]]
  };

  function stick(x, y, color, len) {
    return seg(x, y - len / 2, x, y + len / 2, 9, color, 1);
  }

  // The 8 of bamboo is an "M" below and a "W" above, like the logo.
  // The W is the M turned 180 degrees, so the tile looks the same upside down.
  function mShape(top, upsideDown) {
    var w = 8, y0 = top, y1 = top + 26;
    var a = upsideDown ? y1 - 2 : y0 + 2;
    var b = upsideDown ? y1 - 20 : y0 + 20;
    return seg(14, y0, 14, y1, w, G, 1) +
      seg(14, a, 30, b, w, G, 1) +
      seg(30, b, 46, a, w, G, 1) +
      seg(46, y0, 46, y1, w, G, 1);
  }

  function leaf(d, color) {
    return '<path d="' + d + '" fill="' + color + '"/>' +
      '<path d="' + d + '" fill="' + BAM_DARK + '" opacity=".12"/>';
  }

  // The rooster of the logo, facing left, on a bamboo branch.
  function rooster() {
    return (
      // bamboo stalk and leaves
      seg(13, 50, 13, 78, 5, G, 1) +
      leaf("M13 62 Q26 56 38 66 Q26 70 13 62 Z", G) +
      leaf("M13 68 Q22 62 30 74 Q20 76 13 68 Z", "#2c9a5c") +
      // tail feathers
      '<path d="M38 44 Q62 46 56 16 Q50 34 36 38 Z" fill="' + G + '"/>' +
      '<path d="M38 40 Q58 30 48 6 Q46 26 34 34 Z" fill="' + B + '"/>' +
      '<path d="M37 42 Q54 40 52 22 Q46 34 35 38 Z" fill="#e0b020"/>' +
      // legs
      '<path d="M27 58 L25 68 M25 68 L20 70 M25 68 L28 71 M35 58 L35 67 M35 67 L31 70 M35 67 L38 70" stroke="' + R +
      '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      // body
      '<path d="M16 30 Q12 46 24 56 Q40 62 46 48 Q48 36 38 32 Q28 28 16 30 Z" fill="' + B + '"/>' +
      '<path d="M16 30 Q12 44 20 52 Q26 44 24 32 Z" fill="' + R + '"/>' +
      '<path d="M26 40 Q40 34 44 46 Q36 56 26 50 Z" fill="#e0b020"/>' +
      '<path d="M30 44 Q38 40 41 46" stroke="' + G + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      // head
      '<circle cx="21" cy="24" r="8" fill="' + G + '"/>' +
      '<circle cx="19" cy="14" r="3.2" fill="' + R + '"/><circle cx="23.5" cy="12.5" r="3.4" fill="' + R + '"/>' +
      '<circle cx="28" cy="15" r="3" fill="' + R + '"/>' +
      '<path d="M14 22 L6 25 L14 28 Z" fill="#e0b020"/>' +
      '<ellipse cx="15" cy="32" rx="2.4" ry="3.6" fill="' + R + '"/>' +
      '<circle cx="20" cy="22" r="2" fill="#f6f1e0"/><circle cx="19.6" cy="22" r="1" fill="#14243a"/>'
    );
  }

  function bambooFace(n, red) {
    if (n === 1) return rooster();
    if (n === 8) return mShape(8, true) + mShape(44, false);
    // Shorter sticks where three share a column, so they do not overlap.
    var len = n === 6 || n === 9 ? 18 : n === 7 ? 20 : 22;
    return STICKS[n].map(function (s) { return stick(s[0], s[1], red ? R : s[2], len); }).join("");
  }

  // ---------- Flowers and seasons ----------

  function petals(cx, cy, count, rx, ry, dist, color, start) {
    var out = "";
    for (var k = 0; k < count; k++) {
      var ang = (start || 0) + k * 360 / count;
      out += '<ellipse cx="' + cx + '" cy="' + (cy - dist) + '" rx="' + rx + '" ry="' + ry + '" fill="' + color +
        '" stroke="rgba(0,0,0,.18)" stroke-width=".6" transform="rotate(' + ang + " " + cx + " " + cy + ')"/>';
    }
    return out;
  }

  function blossom(cx, cy, r, color) {
    return petals(cx, cy, 5, r * 0.62, r * 0.62, r * 0.7, color, 0) +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.4) + '" fill="#f2c230"/>';
  }

  function stroke(d, color, w) {
    return '<path d="' + d + '" stroke="' + color + '" stroke-width="' + w + '" fill="none" stroke-linecap="round"/>';
  }

  function cornerNumber(n) { return text(String(n), 9, 15, 12, "#7a6a4a"); }

  function flowerFace(n) {
    var out = cornerNumber(n);
    if (n === 1) { // plum
      out += stroke("M8 74 Q22 54 30 46 Q42 36 52 20", "#6b4a2b", 3) + stroke("M30 46 Q26 36 30 28", "#6b4a2b", 2) +
        blossom(30, 28, 7, "#e8738f") + blossom(46, 28, 7, "#f08aa3") + blossom(20, 56, 6, "#e8738f") +
        '<circle cx="36" cy="44" r="2.5" fill="#e8738f"/><circle cx="52" cy="16" r="2.5" fill="#e8738f"/>';
    } else if (n === 2) { // orchid
      out += leaf("M30 76 Q16 54 6 32 Q26 48 34 76 Z", G) + leaf("M30 76 Q36 48 54 28 Q42 56 36 76 Z", "#2c9a5c") +
        leaf("M30 76 Q28 58 22 44 Q36 58 33 76 Z", "#14653a") +
        stroke("M32 70 Q32 44 36 30", "#2c9a5c", 2) +
        petals(36, 26, 5, 4.5, 8, 7, "#9b5fc0", 0) + '<circle cx="36" cy="26" r="3" fill="#f2c230"/>' +
        petals(34, 46, 5, 3, 5.5, 5, "#b27ad4", 36) + '<circle cx="34" cy="46" r="2" fill="#f2c230"/>';
    } else if (n === 3) { // chrysanthemum
      out += stroke("M30 54 Q32 66 30 78", "#2c9a5c", 2.5) + leaf("M31 68 Q44 60 52 66 Q44 74 31 68 Z", G) +
        leaf("M30 62 Q18 56 10 62 Q18 70 30 62 Z", "#2c9a5c") +
        petals(30, 38, 16, 2.6, 11, 11, "#e6a817", 0) + petals(30, 38, 12, 2.4, 8, 7, "#f4c542", 15) +
        '<circle cx="30" cy="38" r="4" fill="#c0392b"/>';
    } else { // bamboo
      out += seg(16, 26, 16, 78, 6, G, 3) + seg(30, 14, 30, 78, 6, "#2c9a5c", 3) + seg(44, 26, 44, 78, 6, G, 3) +
        leaf("M16 38 Q6 32 4 22 Q14 24 16 38 Z", G) + leaf("M30 28 Q42 22 52 24 Q44 34 30 28 Z", "#2c9a5c") +
        leaf("M44 40 Q54 36 58 28 Q48 28 44 40 Z", G) + leaf("M30 46 Q18 42 12 46 Q20 54 30 46 Z", "#2c9a5c");
    }
    return out;
  }

  function seasonFace(n) {
    var out = cornerNumber(n);
    if (n === 1) { // spring: sprout
      out += '<path d="M6 70 Q30 62 54 70 L54 76 L6 76 Z" fill="#8a6a43"/>' + stroke("M30 66 Q30 50 30 40", "#2c9a5c", 3) +
        leaf("M30 46 Q10 46 8 26 Q28 26 30 46 Z", G) + leaf("M30 40 Q48 40 52 20 Q32 20 30 40 Z", "#2c9a5c") +
        blossom(14, 64, 4, "#e8738f") + blossom(46, 63, 4, "#f08aa3");
    } else if (n === 2) { // summer: lotus
      out += '<ellipse cx="30" cy="66" rx="25" ry="9" fill="' + G + '"/><ellipse cx="30" cy="64" rx="19" ry="5" fill="#2c9a5c"/>' +
        '<g transform="rotate(-45 30 56)"><ellipse cx="30" cy="40" rx="6.5" ry="17" fill="#e86f9a"/></g>' +
        '<g transform="rotate(45 30 56)"><ellipse cx="30" cy="40" rx="6.5" ry="17" fill="#e86f9a"/></g>' +
        '<g transform="rotate(-20 30 56)"><ellipse cx="30" cy="38" rx="7" ry="19" fill="#f08fb0"/></g>' +
        '<g transform="rotate(20 30 56)"><ellipse cx="30" cy="38" rx="7" ry="19" fill="#f08fb0"/></g>' +
        '<ellipse cx="30" cy="36" rx="7" ry="20" fill="#f9b4cc"/>';
    } else if (n === 3) { // autumn: maple leaf
      var half = "M30 8 L35 24 L46 17 L43 33 L55 35 L44 45 L48 55 L34 52 L31 62 L30 62 Z";
      out += '<path d="' + half + '" fill="#c0392b"/><g transform="translate(60 0) scale(-1 1)"><path d="' + half + '" fill="#c0392b"/></g>' +
        stroke("M30 62 L30 76", "#7a4a1f", 3) + stroke("M30 60 L30 24 M30 52 L42 40 M30 52 L18 40", "#f0932b", 1.6);
    } else { // winter: snowflake
      var arm = "M30 40 L30 14 M30 26 L23 19 M30 26 L37 19";
      out += '<circle cx="30" cy="40" r="3" fill="#3a8fc7"/>';
      for (var k = 0; k < 6; k++) {
        out += '<g transform="rotate(' + (k * 60) + ' 30 40)">' + stroke(arm, "#3a8fc7", 2.6) + "</g>";
      }
    }
    return out;
  }

  var NUM = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];

  function charFace(n, red) {
    return text(NUM[n - 1], 30, 36, 30, red ? R : INK) + text("萬", 30, 70, 30, R);
  }

  // Small western number in the top right corner of the suit tiles.
  function suitNumber(n) {
    return text(String(n), 55, 12, 13, "#555");
  }

  // Initial of the wind (E S W N) or of the dragon color, in the top right corner.
  var INITIALS = {
    es: { w: "ESON", d: "RVB" },
    ast: { w: "ESON", d: "RVB" },
    en: { w: "ESWN", d: "RGW" }
  };

  function honorInitial(type) {
    var set = INITIALS[lang] || INITIALS.es;
    return text(set[type.kind].charAt(type.n - 1), 55, 12, 13, "#555");
  }

  function face(type, red) {
    switch (type.kind) {
      case "m": return charFace(type.n, red) + suitNumber(type.n);
      case "p": return dotsFace(type.n, red) + suitNumber(type.n);
      case "s": return bambooFace(type.n, red) + suitNumber(type.n);
      case "w": return text(type.ch, 30, 56, 46, INK) + honorInitial(type);
      case "d":
        if (type.ch === "白") {
          return honorInitial(type) + '<rect x="11" y="13" width="38" height="54" rx="3" fill="none" stroke="' + B + '" stroke-width="4"/>' +
            '<rect x="16" y="18" width="28" height="44" rx="1.5" fill="none" stroke="' + B + '" stroke-width="1.5"/>';
        }
        return text(type.ch, 30, 57, 46, type.ch === "中" ? R : G) + honorInitial(type);
      case "f":
        return flowerFace(type.n);
      case "t":
        return seasonFace(type.n);
    }
    return "";
  }

  // ---------- Tile names (tooltips) ----------

  var lang = (document.documentElement.lang || "es").slice(0, 3) === "ast" ? "ast" :
    (document.documentElement.lang || "es").slice(0, 2);
  var NAMES = {
    es: {
      m: "{n} de caracteres", p: "{n} de círculos", s: "{n} de bambús",
      w: ["Viento Este", "Viento Sur", "Viento Oeste", "Viento Norte"],
      d: ["Dragón rojo", "Dragón verde", "Dragón blanco"],
      f: ["Ciruelo", "Orquídea", "Crisantemo", "Bambú"],
      t: ["Primavera", "Verano", "Otoño", "Invierno"]
    },
    ast: {
      m: "{n} de caracteres", p: "{n} de círculos", s: "{n} de bambús",
      w: ["Vientu Este", "Vientu Sur", "Vientu Oeste", "Vientu Norte"],
      d: ["Dragón royu", "Dragón verde", "Dragón blancu"],
      f: ["Ciruelu", "Orquídea", "Crisantemu", "Bambú"],
      t: ["Primavera", "Branu", "Seronda", "Iviernu"]
    },
    en: {
      m: "{n} of Characters", p: "{n} of Circles", s: "{n} of Bamboo",
      w: ["East Wind", "South Wind", "West Wind", "North Wind"],
      d: ["Red Dragon", "Green Dragon", "White Dragon"],
      f: ["Plum", "Orchid", "Chrysanthemum", "Bamboo"],
      t: ["Spring", "Summer", "Autumn", "Winter"]
    }
  };

  var RED_FIVE = { es: "{name} (rojo)", ast: "{name} (royu)", en: "{name} (red)" };

  function tileName(type, red) {
    var names = NAMES[lang] || NAMES.es;
    var v = names[type.kind];
    var name = typeof v === "string" ? v.replace("{n}", type.n) : v[type.n - 1];
    return red ? (RED_FIVE[lang] || RED_FIVE.es).replace("{name}", name) : name;
  }

  // ---------- Tile set and piles ----------

  var types = [];
  function add(kind, n, ch, copies, col, row, base) {
    types.push({ kind: kind, n: n, ch: ch, copies: copies, col: col, row: row, base: base || 0 });
  }
  var i;
  for (i = 1; i <= 9; i++) add("m", i, "", 4, 0, i - 1);
  for (i = 1; i <= 9; i++) add("p", i, "", 4, 1, i - 1);
  for (i = 1; i <= 9; i++) add("s", i, "", 4, 2, i - 1);
  ["東", "南", "西", "北"].forEach(function (c, k) { add("w", k + 1, c, 4, 3, k); });
  ["中", "發", "白"].forEach(function (c, k) { add("d", k + 1, c, 4, 3, k + 4); });
  ["梅", "蘭", "菊", "竹"].forEach(function (c, k) { add("f", k + 1, c, 1, 3, 7, k); });
  ["春", "夏", "秋", "冬"].forEach(function (c, k) { add("t", k + 1, c, 1, 3, 8, k); });

  // The four columns go together on the right side.
  // The 4 flowers and the 4 seasons make two piles at the end of column 3.
  var tiles = [];
  var redTiles = [];
  var zTop = 1000;

  types.forEach(function (type) {
    // One of the four 5s of each suit is red (Riichi). It is the top tile of the pile.
    var hasRed = type.n === 5 && "mps".indexOf(type.kind) >= 0;
    for (var c = 0; c < type.copies; c++) {
      var red = hasRed && c === type.copies - 1;
      var name = tileName(type, false);
      var svg = '<svg viewBox="0 0 60 80" aria-hidden="true" focusable="false">' + face(type, false) + "</svg>";
      var el = document.createElement("div");
      el.className = "tile";
      el.title = name;
      el.innerHTML = svg;
      table.appendChild(el);
      var tile = { el: el, type: type, copy: c + type.base, home: true, x: 0, y: 0 };
      if (red) {
        tile.plain = { name: name, svg: svg };
        tile.red = {
          name: tileName(type, true),
          svg: '<svg viewBox="0 0 60 80" aria-hidden="true" focusable="false">' + face(type, true) + "</svg>"
        };
        redTiles.push(tile);
      }
      tiles.push(tile);
    }
  });

  // ---------- Red fives switch ----------

  function setRedFives(on) {
    redTiles.forEach(function (t) {
      var look = on ? t.red : t.plain;
      t.el.title = look.name;
      t.el.innerHTML = look.svg;
    });
  }

  // ---------- Layout ----------

  var W = 0, H = 0, tw = 40, th = 52, offset = 3, gap = 8;
  var barH = 0;

  function homePos(t) {
    var col = t.type.col;
    var step = tw + offset * 3 + gap;
    var x = W - gap - (4 - col) * step; // all four columns from the right edge
    var y = barH + gap + t.type.row * (th + gap);
    return { x: x + t.copy * offset, y: y - t.copy * offset };
  }

  function place(t) {
    var p = t.home ? homePos(t) : t;
    t.el.style.transform = "translate(" + p.x + "px," + p.y + "px)";
    if (t.home) {
      t.x = p.x;
      t.y = p.y;
      t.el.style.zIndex = t.type.row * 10 + t.copy;
    }
  }

  function layout() {
    var rect = table.getBoundingClientRect();
    var oldTw = tw;
    W = rect.width;
    H = rect.height;
    var bar = document.getElementById("bar");
    barH = bar ? bar.offsetHeight : 0;
    var byHeight = (H - barH - gap * 10) / (9 * RATIO + 0.1);
    var byWidth = (W * 0.55 - 5 * gap) / 4.6;
    tw = Math.floor(Math.max(24, Math.min(64, byHeight, byWidth)));
    th = Math.round(tw * RATIO);
    offset = Math.max(2, Math.round(tw / 20));
    table.style.setProperty("--tw", tw + "px");
    table.style.setProperty("--th", th + "px");
    var k = tw / oldTw;
    tiles.forEach(function (t) {
      if (!t.home && oldTw !== tw) {
        t.x *= k;
        t.y *= k;
        clamp(t);
      }
      place(t);
    });
  }

  function clamp(t) {
    t.x = Math.max(0, Math.min(W - tw, t.x));
    t.y = Math.max(barH, Math.min(H - th, t.y));
  }

  // ---------- Magnetism ----------

  function snap(t, x, y) {
    var limit = tw * 0.35;
    var best = null, bestD = limit;
    var bestX = null, bestXd = limit * 0.6;
    var bestY = null, bestYd = limit * 0.6;
    tiles.forEach(function (o) {
      if (o === t || o.home || inGroup(o)) return;
      var targets = [
        [o.x + tw, o.y], [o.x - tw, o.y], [o.x, o.y + th], [o.x, o.y - th],
        [o.x + tw, o.y + th], [o.x - tw, o.y + th], [o.x + tw, o.y - th], [o.x - tw, o.y - th]
      ];
      targets.forEach(function (p) {
        var d = Math.hypot(p[0] - x, p[1] - y);
        if (d < bestD) { bestD = d; best = p; }
      });
      var dx = Math.abs(o.x - x), dy = Math.abs(o.y - y);
      if (dx < bestXd) { bestXd = dx; bestX = o.x; }
      if (dy < bestYd) { bestYd = dy; bestY = o.y; }
    });
    if (best) return { x: best[0], y: best[1] };
    return { x: bestX === null ? x : bestX, y: bestY === null ? y : bestY };
  }

  // ---------- Drag and drop ----------

  var drag = null;
  var lastTap = { tile: null, time: 0 };
  var lastTouched = null; // last tile touched that is on the table

  function isFree(t, x, y) {
    if (x < 0 || x > W - tw || y < barH || y > H - th) return false;
    return !tiles.some(function (o) {
      return o !== t && Math.abs(o.x - x) < tw * 0.9 && Math.abs(o.y - y) < th * 0.9;
    });
  }

  // Put a tile from a pile to the right of the last touched tile, or to the center.
  function putOnTable(t) {
    var x = (W - tw) / 2, y = barH + (H - barH - th) / 2;
    if (lastTouched && !lastTouched.home && isFree(t, lastTouched.x + tw, lastTouched.y)) {
      x = lastTouched.x + tw;
      y = lastTouched.y;
    }
    t.home = false;
    t.x = x;
    t.y = y;
    t.el.style.zIndex = ++zTop;
    place(t);
    lastTouched = t;
  }

  function tileOf(el) {
    for (var k = 0; k < tiles.length; k++) if (tiles[k].el === el) return tiles[k];
    return null;
  }

  var selected = [];
  var marquee = null;

  function select(list) {
    selected.forEach(function (t) { t.el.classList.remove("selected"); });
    selected = list;
    selected.forEach(function (t) { t.el.classList.add("selected"); });
  }

  function sendHome(t) {
    t.home = true;
    if (selected.indexOf(t) >= 0) select(selected.filter(function (o) { return o !== t; }));
    place(t);
  }

  function inGroup(o) {
    return drag && drag.group.indexOf(o) >= 0;
  }

  table.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    var rect = table.getBoundingClientRect();
    var el = e.target.closest(".tile");
    if (!el) {
      // Empty table: start a selection rectangle.
      if (e.target.closest("#bar") || e.target.closest("a") || e.target.closest("button")) return;
      e.preventDefault();
      var box = document.createElement("div");
      box.className = "marquee";
      table.appendChild(box);
      marquee = {
        id: e.pointerId,
        x0: e.clientX - rect.left,
        y0: e.clientY - rect.top,
        box: box,
        add: e.shiftKey || e.ctrlKey || e.metaKey,
        base: selected.slice()
      };
      table.setPointerCapture(e.pointerId);
      if (!marquee.add) select([]);
      return;
    }
    var t = tileOf(el);
    if (!t) return;
    e.preventDefault();
    if (selected.indexOf(t) < 0) select([]);
    var group = selected.length > 1 ? selected.slice() : [t];
    drag = {
      tile: t,
      group: group,
      starts: group.map(function (o) { return { x: o.x, y: o.y }; }),
      id: e.pointerId,
      dx: e.clientX - rect.left - t.x,
      dy: e.clientY - rect.top - t.y,
      sx: e.clientX,
      sy: e.clientY,
      moved: false
    };
    if (!t.home) lastTouched = t;
    el.setPointerCapture(e.pointerId);
    group.forEach(function (o) {
      o.el.classList.add("dragging");
      o.el.style.zIndex = ++zTop;
    });
  });

  function moveMarquee(e) {
    var rect = table.getBoundingClientRect();
    var x = Math.max(0, Math.min(W, e.clientX - rect.left));
    var y = Math.max(0, Math.min(H, e.clientY - rect.top));
    var l = Math.min(x, marquee.x0), r = Math.max(x, marquee.x0);
    var tp = Math.min(y, marquee.y0), bt = Math.max(y, marquee.y0);
    var st = marquee.box.style;
    st.left = l + "px";
    st.top = tp + "px";
    st.width = (r - l) + "px";
    st.height = (bt - tp) + "px";
    var hit = tiles.filter(function (t) {
      return !t.home && t.x < r && t.x + tw > l && t.y < bt && t.y + th > tp;
    });
    marquee.base.forEach(function (t) { if (hit.indexOf(t) < 0) hit.push(t); });
    select(hit);
  }

  table.addEventListener("pointermove", function (e) {
    if (marquee && e.pointerId === marquee.id) { moveMarquee(e); return; }
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 4) return;
    drag.moved = true;
    var t = drag.tile;
    lastTouched = t;
    var rect = table.getBoundingClientRect();
    var g = drag.group, st = drag.starts;
    var li = g.indexOf(t);
    t.home = false;
    var x = e.clientX - rect.left - drag.dx;
    var y = e.clientY - rect.top - drag.dy;
    if (!e.altKey) {
      var s = snap(t, x, y);
      x = s.x;
      y = s.y;
    }
    var dx = x - st[li].x, dy = y - st[li].y;
    // Keep the whole group inside the table.
    var loX = -Infinity, hiX = Infinity, loY = -Infinity, hiY = Infinity;
    st.forEach(function (p) {
      loX = Math.max(loX, -p.x); hiX = Math.min(hiX, W - tw - p.x);
      loY = Math.max(loY, barH - p.y); hiY = Math.min(hiY, H - th - p.y);
    });
    dx = Math.max(loX, Math.min(hiX, dx));
    dy = Math.max(loY, Math.min(hiY, dy));
    g.forEach(function (o, k) {
      o.home = false;
      o.x = st[k].x + dx;
      o.y = st[k].y + dy;
      place(o);
    });
  });

  function endDrag(e) {
    if (marquee && e.pointerId === marquee.id) {
      marquee.box.remove();
      marquee = null;
      return;
    }
    if (!drag || e.pointerId !== drag.id) return;
    var t = drag.tile;
    drag.group.forEach(function (o) { o.el.classList.remove("dragging"); });
    if (!drag.moved) {
      var now = Date.now();
      if (lastTap.tile === t && now - lastTap.time < 400) {
        if (t.home) putOnTable(t);
        else sendHome(t);
        lastTap.tile = null;
      } else {
        lastTap.tile = t;
        lastTap.time = now;
        if (t.home) t.el.style.zIndex = t.type.row * 10 + t.copy;
      }
    } else {
      lastTap.tile = null;
    }
    drag = null;
  }

  table.addEventListener("pointerup", endDrag);
  table.addEventListener("pointercancel", endDrag);
  table.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  // ---------- Buttons ----------

  var clear = document.getElementById("clear");
  if (clear) {
    clear.addEventListener("click", function () {
      select([]);
      tiles.forEach(sendHome);
      lastTouched = null;
    });
  }

  var full = document.getElementById("fullscreen");
  if (full) {
    var root = document.documentElement;
    if (!root.requestFullscreen) {
      full.hidden = true;
    } else {
      full.addEventListener("click", function () {
        if (document.fullscreenElement) document.exitFullscreen();
        else root.requestFullscreen();
      });
    }
  }

  var redBtn = document.getElementById("red-fives");
  if (redBtn) {
    var redOn = false;
    try { redOn = localStorage.getItem("mesa-red-fives") === "1"; } catch (e) {}
    var applyRed = function () {
      redBtn.setAttribute("aria-pressed", redOn ? "true" : "false");
      setRedFives(redOn);
    };
    redBtn.addEventListener("click", function () {
      redOn = !redOn;
      try { localStorage.setItem("mesa-red-fives", redOn ? "1" : "0"); } catch (e) {}
      applyRed();
    });
    applyRed();
  }

  // Flowers and seasons: when off, they go back to their pile and are hidden.
  var flowerBtn = document.getElementById("flowers");
  if (flowerBtn) {
    var flowersOn = false;
    try { flowersOn = localStorage.getItem("mesa-flowers") === "1"; } catch (e) {}
    var applyFlowers = function () {
      flowerBtn.setAttribute("aria-pressed", flowersOn ? "true" : "false");
      tiles.forEach(function (t) {
        if (t.type.kind !== "f" && t.type.kind !== "t") return;
        if (!flowersOn) sendHome(t);
        t.el.style.display = flowersOn ? "" : "none";
      });
      if (!flowersOn && lastTouched && lastTouched.home) lastTouched = null;
    };
    flowerBtn.addEventListener("click", function () {
      flowersOn = !flowersOn;
      try { localStorage.setItem("mesa-flowers", flowersOn ? "1" : "0"); } catch (e) {}
      applyFlowers();
    });
    applyFlowers();
  }

  // ---------- Help ----------

  var helpBtn = document.getElementById("help-btn");
  if (helpBtn) {
    var helpTimer = null;
    var setHelp = function (open, delay) {
      clearTimeout(helpTimer);
      helpBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open && delay) helpTimer = setTimeout(function () { setHelp(false); }, delay);
    };
    setHelp(true, 9000); // open at start, hide after a few seconds
    helpBtn.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "mouse") setHelp(true);
    });
    helpBtn.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "mouse") setHelp(false, 1200);
    });
    helpBtn.addEventListener("click", function (e) {
      if (e.pointerType === "mouse") return; // hover already opened it
      setHelp(helpBtn.getAttribute("aria-expanded") !== "true", 9000);
    });
    helpBtn.addEventListener("blur", function () { setHelp(false); });
    // A press anywhere outside the help button closes the help.
    document.addEventListener("pointerdown", function (e) {
      if (!helpBtn.contains(e.target)) setHelp(false);
    }, true);
  }

  window.addEventListener("resize", layout);
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
})();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js").catch(function () {});
  });
}
