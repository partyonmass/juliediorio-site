// Strip gallery: one centred photo at full strength, neighbours faded,
// auto-advancing and looping forever. Click a neighbour to jump to it;
// click the centred photo to follow its link (if it has one).
(function () {
  var INTERVAL = 4000;

  document.querySelectorAll('.strip').forEach(function (strip) {
    var track = strip.querySelector('.strip-track');
    var originals = Array.prototype.slice.call(track.children);
    var n = originals.length;
    if (!n) return;

    // Three copies of the set so there is always something either side.
    [0, 1].forEach(function () {
      originals.forEach(function (s) { track.appendChild(s.cloneNode(true)); });
    });
    var slides = Array.prototype.slice.call(track.children);
    var index = n; // start on the first photo of the middle copy
    var timer = null;

    function size() {
      var h = strip.clientHeight;
      slides.forEach(function (s) {
        s.style.width = Math.round(h * parseFloat(s.dataset.ratio)) + 'px';
      });
    }

    function place(animate) {
      track.classList.toggle('no-anim', !animate);
      var s = slides[index];
      var x = strip.clientWidth / 2 - (s.offsetLeft + s.offsetWidth / 2);
      track.style.transform = 'translateX(' + x + 'px)';
      slides.forEach(function (el, i) { el.classList.toggle('active', i === index); });
      if (!animate) void track.offsetWidth; // flush so the next move animates
    }

    function go(i) {
      index = i;
      place(true);
    }

    track.addEventListener('transitionend', function (e) {
      if (e.target !== track) return;
      if (index >= 2 * n) { index -= n; place(false); }
      else if (index < n) { index += n; place(false); }
    });

    function start() { stop(); timer = setInterval(function () { go(index + 1); }, INTERVAL); }
    function stop() { if (timer) clearInterval(timer); timer = null; }

    slides.forEach(function (s, i) {
      s.addEventListener('click', function () {
        if (i === index) {
          if (s.dataset.href) window.open(s.dataset.href, '_blank', 'noopener');
        } else {
          go(i);
          start();
        }
      });
    });

    strip.addEventListener('mouseenter', stop);
    strip.addEventListener('mouseleave', start);
    window.addEventListener('resize', function () { size(); place(false); });

    size();
    place(false);
    start();
  });
})();

// Parallax fallback. The effect itself lives in css/style.css and is driven
// by the browser's scroll timeline. This only runs in browsers that don't
// support that yet, and reproduces the same movement from scroll events.
(function () {
  if (window.CSS && CSS.supports && CSS.supports('animation-timeline: view()')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var layers = Array.prototype.slice.call(document.querySelectorAll('.px-layer'));
  if (!layers.length) return;
  var wide = window.matchMedia('(min-width: 1001px)');
  var ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    layers.forEach(function (layer) {
      if (!wide.matches) { layer.style.transform = ''; return; }
      var r = layer.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      layer.style.transform = 'translate3d(0,' + (-0.8 * r.top).toFixed(1) + 'px,0)';
    });
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
