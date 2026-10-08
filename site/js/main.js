(function () {
  var menuButton = document.getElementById("menu-toggle");
  var menu = document.getElementById("site-menu");
  if (menuButton && menu) {
    var setMenu = function (open) {
      menu.classList.toggle("open", open);
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    };
    menuButton.addEventListener("click", function () {
      setMenu(!menu.classList.contains("open"));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        setMenu(false);
        menuButton.focus();
      }
    });
  }
})();

(function () {
  var root = document.documentElement;
  var button = document.getElementById("theme-toggle");
  if (!button) return;

  function isDark() {
    return root.getAttribute("data-theme") === "dark";
  }

  var SUN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="4.5" fill="currentColor"/>' +
    '<path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>';
  var MOON =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>';

  function refresh() {
    var dark = isDark();
    button.innerHTML = dark ? SUN : MOON;
    button.setAttribute(
      "aria-label",
      dark ? button.getAttribute("data-to-light") : button.getAttribute("data-to-dark")
    );
  }

  button.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    refresh();
  });

  refresh();
})();

(function () {
  var videos = document.querySelectorAll(".video[data-id]");
  Array.prototype.forEach.call(videos, function (box) {
    var link = box.querySelector(".video-link");
    if (!link) return;
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var frame = document.createElement("iframe");
      frame.src = "https://www.youtube-nocookie.com/embed/" + box.getAttribute("data-id") + "?autoplay=1&rel=0";
      frame.title = box.getAttribute("data-title") || "";
      frame.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
      frame.setAttribute("allowfullscreen", "");
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      link.replaceWith(frame);
    });
  });
})();

(function () {
  // Group the menu behind the menu button when the buttons do not fit in one line.
  var root = document.documentElement;
  var nav = document.querySelector(".nav");
  if (!nav) return;
  function fit() {
    var was = root.classList.contains("compact");
    // Measure the full menu in its wide layout. Leave room for the small logo on each side.
    root.classList.remove("compact");
    var needed = nav.offsetWidth + 2 * 56;
    var compact = window.innerWidth <= 760 || needed > root.clientWidth;
    root.classList.toggle("compact", compact);
    if (was && !compact) {
      var menu = document.getElementById("site-menu");
      var button = document.getElementById("menu-toggle");
      if (menu) menu.classList.remove("open");
      if (button) button.setAttribute("aria-expanded", "false");
    }
  }
  fit();
  window.addEventListener("resize", fit);
  window.addEventListener("load", fit);
})();

(function () {
  // On wide screens only the menu row stays visible while scrolling.
  // The top bar (logo, flags, theme) scrolls away. Without JS the whole header sticks.
  var topbar = document.querySelector(".topbar");
  if (!topbar) return;
  function measure() {
    document.documentElement.style.setProperty("--topbar-h", topbar.offsetHeight + "px");
    // Right end of the last menu item, so the flags sit next to it.
    var last = document.querySelector(".nav > ul > li:last-child");
    var wrap = topbar.parentNode;
    if (last && wrap) {
      var end = last.getBoundingClientRect().right - wrap.getBoundingClientRect().left;
      document.documentElement.style.setProperty("--menu-end", end + "px");
    }
  }
  measure();
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);
})();

(function () {
  // Submenu of the main menu: the arrow button opens and closes it.
  var items = document.querySelectorAll(".nav .has-sub");
  function close(item) {
    item.classList.remove("open");
    var b = item.querySelector(".sub-toggle");
    if (b) b.setAttribute("aria-expanded", "false");
  }
  Array.prototype.forEach.call(items, function (item) {
    var button = item.querySelector(".sub-toggle");
    if (!button) return;
    button.addEventListener("click", function () {
      var open = !item.classList.contains("open");
      item.classList.toggle("open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
    item.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && item.classList.contains("open")) {
        close(item);
        button.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (!item.contains(e.target)) close(item);
    });
  });
})();

(function () {
  // Show the small logo in the menu row once the top bar has scrolled out of view.
  var header = document.querySelector(".site-header");
  var brandLogo = document.querySelector(".brand img");
  if (!header || !brandLogo) return;
  var leaveTimer;
  function update() {
    // True when the logo in the title is no longer visible.
    var gone = brandLogo.getBoundingClientRect().bottom <= 0;
    var was = header.classList.contains("stuck");
    header.classList.toggle("stuck", gone);
    if (was && !gone) {
      // Keep the flags in place while they fade out.
      header.classList.add("tools-leaving");
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(function () { header.classList.remove("tools-leaving"); }, 200);
    } else if (gone) {
      clearTimeout(leaveTimer);
      header.classList.remove("tools-leaving");
    }
  }
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
})();

(function () {
  // Add a link icon to each h2 and h3 so readers can copy a link to that section.
  // Headings without an id get one made from their text.
  var main = document.getElementById("main");
  if (!main) return;
  var headings = main.querySelectorAll("h2, h3");
  if (!headings.length) return;

  var used = {};
  Array.prototype.forEach.call(document.querySelectorAll("[id]"), function (el) {
    used[el.id] = true;
  });

  function slug(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "seccion";
  }

  var ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/>' +
    '<path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>';

  var CHECK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  Array.prototype.forEach.call(headings, function (h) {
    if (!h.id) {
      var base = slug(h.textContent);
      var id = base;
      var n = 2;
      while (used[id]) id = base + "-" + n++;
      used[id] = true;
      h.id = id;
    }
    var a = document.createElement("a");
    a.className = "anchor";
    a.href = "#" + h.id;
    a.setAttribute("aria-label", h.textContent.trim());
    a.innerHTML = ICON;
    a.addEventListener("click", function (e) {
      e.preventDefault();
      history.replaceState(null, "", a.hash);
      var url = location.href;
      var done = function () {
        a.innerHTML = CHECK;
        a.classList.add("copied");
        clearTimeout(a.timer);
        a.timer = setTimeout(function () {
          a.innerHTML = ICON;
          a.classList.remove("copied");
        }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () {});
      } else {
        var box = document.createElement("textarea");
        box.value = url;
        box.style.position = "fixed";
        box.style.opacity = "0";
        document.body.appendChild(box);
        box.select();
        try { if (document.execCommand("copy")) done(); } catch (err) {}
        document.body.removeChild(box);
      }
    });
    h.appendChild(a);
  });

  // The browser already tried to scroll before the ids existed.
  if (location.hash.length > 1) {
    var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) target.scrollIntoView();
  }
})();

// Keep the reading position when the language changes.
// The position is stored as the last heading above the top of the window, plus the distance from it.
// Headings have the same id in every language. If there is no heading, the page ratio is used.
(function () {
  var KEY = "langScroll";
  var links = document.querySelectorAll(".tools a[hreflang]");
  if (!links.length) return;

  function top(el) {
    return el.getBoundingClientRect().top + window.pageYOffset;
  }

  links.forEach(function (a) {
    a.addEventListener("click", function () {
      var y = window.pageYOffset;
      var heads = document.querySelectorAll("h2[id], h3[id]");
      var found = null;
      for (var i = 0; i < heads.length; i++) {
        if (top(heads[i]) <= y + 1) found = heads[i];
        else break;
      }
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var data = {
        to: a.pathname,
        id: found ? found.id : "",
        offset: found ? y - top(found) : 0,
        ratio: max > 0 ? y / max : 0
      };
      try {
        sessionStorage.setItem(KEY, JSON.stringify(data));
      } catch (e) {}
    });
  });

  var data = null;
  try {
    data = JSON.parse(sessionStorage.getItem(KEY));
    sessionStorage.removeItem(KEY);
  } catch (e) {}
  if (!data || data.to !== location.pathname || location.hash) return;

  function restore() {
    var el = data.id ? document.getElementById(data.id) : null;
    if (el) {
      window.scrollTo(0, top(el) + data.offset);
    } else {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, max * data.ratio);
    }
  }
  restore();
  window.addEventListener("load", restore);
})();
