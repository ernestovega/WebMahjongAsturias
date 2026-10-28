(function () {
  var items = document.querySelectorAll("[data-hand]");
  if (!items.length || !window.MJHand) return;

  var pop = document.createElement("div");
  pop.className = "hand-pop";
  pop.setAttribute("role", "tooltip");
  pop.id = "hand-pop";
  pop.hidden = true;
  document.body.appendChild(pop);

  var current = null;
  var shownAt = 0;

  function place(el) {
    pop.style.left = "";
    pop.style.top = "";
    if (window.matchMedia("(max-width: 700px)").matches) return;
    var r = el.getBoundingClientRect();
    var w = pop.offsetWidth;
    var h = pop.offsetHeight;
    var left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8);
    var top = r.bottom + 8;
    if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 8);
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }

  function show(el) {
    var nm = el.querySelector(".nm");
    var title = document.createElement("div");
    title.className = "hp-title";
    var jp = el.querySelector(".jp");
    title.textContent = (nm ? nm.textContent : "") + (jp ? " · " + jp.textContent : "");
    var tiles = document.createElement("div");
    tiles.className = "hp-tiles";
    tiles.innerHTML = window.MJHand(el.getAttribute("data-hand"));
    pop.innerHTML = "";
    pop.appendChild(title);
    pop.appendChild(tiles);
    pop.hidden = false;
    if (current) current.removeAttribute("aria-describedby");
    current = el;
    el.setAttribute("aria-describedby", "hand-pop");
    shownAt = Date.now();
    place(el);
  }

  function hide() {
    pop.hidden = true;
    if (current) current.removeAttribute("aria-describedby");
    current = null;
  }

  Array.prototype.forEach.call(items, function (el) {
    el.addEventListener("mouseenter", function () { show(el); });
    el.addEventListener("mouseleave", hide);
    el.addEventListener("focus", function () { show(el); });
    el.addEventListener("blur", hide);
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      // A tap fires mouseenter first, so ignore the toggle right after showing.
      if (current === el && Date.now() - shownAt > 400) hide();
      else show(el);
    });
  });

  document.addEventListener("click", hide);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") hide();
  });
  window.addEventListener("scroll", function () { if (current) place(current); }, { passive: true });
  window.addEventListener("resize", hide);
})();
