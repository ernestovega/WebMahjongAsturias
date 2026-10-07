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
  // On wide screens only the menu row stays visible while scrolling.
  // The top bar (logo, flags, theme) scrolls away. Without JS the whole header sticks.
  var topbar = document.querySelector(".topbar");
  if (!topbar) return;
  function measure() {
    document.documentElement.style.setProperty("--topbar-h", topbar.offsetHeight + "px");
  }
  measure();
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);
})();
