(function () {
  var list = document.querySelector(".mcr-list");
  var input = document.getElementById("mcr-q");
  var count = document.getElementById("mcr-count");
  if (!list || !input) return;

  var rows = Array.prototype.slice.call(list.querySelectorAll(".mrow"));
  var search = document.querySelector(".mcr-search");
  var header = document.querySelector(".site-header");
  var root = document.documentElement;

  // Draw the example tiles
  if (window.MJHand) {
    rows.forEach(function (r) {
      var ex = r.querySelector(".ex");
      ex.innerHTML = window.MJHand(ex.getAttribute("data-ex"));
    });
  }

  function norm(s) {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[’']/g, " ").replace(/\s+/g, " ").trim();
  }
  rows.forEach(function (r) { r._s = norm(r.getAttribute("data-s")); });

  // Offsets of the sticky bars (the site header can change height)
  var ticking = false;
  function measure() {
    ticking = false;
    var top = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
    root.style.setProperty("--stick-top", top + "px");
    root.style.setProperty("--search-h", search.offsetHeight + "px");
    var h = list.querySelector(".mg-h");
    if (h) root.style.setProperty("--pts-h", h.offsetHeight + "px");
  }
  function queue() {
    if (!ticking) { ticking = true; requestAnimationFrame(measure); }
  }
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  measure();

  var matches = [];
  var pos = 0;

  function goTo(row) {
    measure();
    var stick = parseFloat(getComputedStyle(root).getPropertyValue("--stick-top")) || 0;
    var h = list.querySelector(".mg-h").offsetHeight;
    var offset = stick + search.offsetHeight + h + 2;
    var y = row.getBoundingClientRect().top + window.pageYOffset - offset;
    var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: Math.max(0, y), behavior: calm ? "auto" : "smooth" });
  }

  function run() {
    var q = norm(input.value);
    rows.forEach(function (r) { r.classList.remove("hit"); });
    matches = [];
    pos = 0;
    if (!q) { count.textContent = ""; return; }
    var words = q.split(" ");
    rows.forEach(function (r) {
      if (words.every(function (w) { return r._s.indexOf(w) !== -1; })) matches.push(r);
    });
    matches.forEach(function (r) { r.classList.add("hit"); });
    if (!matches.length) { count.textContent = list.getAttribute("data-none"); return; }
    count.textContent = "1 / " + matches.length;
    goTo(matches[0]);
  }

  input.addEventListener("input", run);
  input.addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter" || matches.length < 2) return;
    ev.preventDefault();
    pos = (pos + (ev.shiftKey ? matches.length - 1 : 1)) % matches.length;
    count.textContent = (pos + 1) + " / " + matches.length;
    goTo(matches[pos]);
  });
})();
