(function () {
  // Tile faces (SVG, viewBox 60 x 80). Same drawings as the practice table.
  var lang = (document.documentElement.lang || "es").slice(0, 3) === "ast" ? "ast" :
    (document.documentElement.lang || "es").slice(0, 2);
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

  function dotsFace(n) {
    if (n === 1) {
      return '<circle cx="30" cy="40" r="22" fill="' + G + '"/>' +
        '<circle cx="30" cy="40" r="16" fill="#f6f1e0"/>' +
        '<circle cx="30" cy="40" r="11" fill="' + R + '"/>' +
        '<circle cx="30" cy="40" r="5" fill="#f6f1e0"/>';
    }
    var r = n === 2 ? DOT_R_TWO : n === 3 ? DOT_R_FEW : DOT_R;
    return DOTS[n].map(function (d) { return dot(d[0], d[1], r, d[2]); }).join("");
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

  function bambooFace(n) {
    if (n === 1) return rooster();
    if (n === 8) return mShape(8, true) + mShape(44, false);
    // Shorter sticks where three share a column, so they do not overlap.
    var len = n === 6 || n === 9 ? 18 : n === 7 ? 20 : 22;
    return STICKS[n].map(function (s) { return stick(s[0], s[1], s[2], len); }).join("");
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

  function charFace(n) {
    return text(NUM[n - 1], 30, 36, 30, INK) + text("萬", 30, 70, 30, R);
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

  function face(type) {
    switch (type.kind) {
      case "m": return charFace(type.n) + suitNumber(type.n);
      case "p": return dotsFace(type.n) + suitNumber(type.n);
      case "s": return bambooFace(type.n) + suitNumber(type.n);
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


  var WINDS = ["東", "南", "西", "北"];
  var DRAGONS = ["中", "發", "白"];

  // Code: digit + suit letter (m characters, p circles, s bamboo, z honors).
  // Honors: z1-z4 winds E S W N, z5 white, z6 green, z7 red.
  // Flowers f1-f4 and seasons t1-t4 are single tokens.
  function typeOf(n, suit) {
    if (suit === "z") {
      if (n <= 4) return { kind: "w", n: n, ch: WINDS[n - 1] };
      var d = { 5: 3, 6: 2, 7: 1 }[n];
      return { kind: "d", n: d, ch: DRAGONS[d - 1] };
    }
    return { kind: suit, n: n, ch: "" };
  }

  function tile(type, hl) {
    return '<svg class="tile' + (hl ? " hl" : "") + '" viewBox="0 0 60 80" aria-hidden="true" focusable="false">' +
      '<rect x="1" y="1" width="58" height="78" rx="7" fill="#f6f1e0" stroke="#8a7f66" stroke-width="2"/>' +
      face(type) + "</svg>";
  }

  // Face-down tile (concealed kong).
  function back() {
    return '<svg class="tile back" viewBox="0 0 60 80" aria-hidden="true" focusable="false">' +
      '<rect x="1" y="1" width="58" height="78" rx="7" fill="#1e7a46" stroke="#0f4a2b" stroke-width="2"/>' +
      '<rect x="9" y="10" width="42" height="60" rx="4" fill="none" stroke="#e8b923" stroke-width="2"/></svg>';
  }

  // "123m 55z 7!p": groups separated by spaces, "!" marks the tile before it.
  // "^2222m" is a concealed kong: the two outer tiles are face down.
  function hand(code) {
    return code.split(/\s+/).filter(Boolean).map(function (tok) {
      var out = [];
      var m = /^([ft])(\d)$/.exec(tok);
      var hidden = tok.charAt(0) === "^";
      if (hidden) tok = tok.slice(1);
      if (m) {
        out.push(tile({ kind: m[1], n: +m[2], ch: "" }, false));
      } else {
        var pending = [];
        for (var i = 0; i < tok.length; i++) {
          var c = tok.charAt(i);
          if (c === "!") pending[pending.length - 1].hl = true;
          else if (c >= "0" && c <= "9") pending.push({ n: +c, hl: false });
          else pending.forEach(function (p) { out.push(tile(typeOf(p.n, c), p.hl)); });
        }
      }
      if (hidden && out.length === 4) { out[0] = back(); out[3] = back(); }
      return '<span class="grp">' + out.join("") + "</span>";
    }).join("");
  }

  window.MJHand = hand;
})();
