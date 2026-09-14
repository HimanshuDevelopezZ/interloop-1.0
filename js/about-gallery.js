/**
 * About Section — Image Slideshow Controller
 * Auto-advances every 4s, with prev/next buttons and clickable dot indicators.
 */
(function () {
  "use strict";

  var INTERVAL_MS = 4000;

  var slideshow = document.getElementById("aboutSlideshow");
  if (!slideshow) return;

  var slides    = Array.from(slideshow.querySelectorAll(".about-slide"));
  var prevBtn   = document.getElementById("aboutSlidePrev");
  var nextBtn   = document.getElementById("aboutSlideNext");
  var dotsWrap  = document.getElementById("aboutSlideDots");
  var counter   = document.getElementById("aboutSlideCounter");
  var total     = slides.length;

  var current = 0;
  var timer   = null;

  // Build dot indicators
  slides.forEach(function (_, i) {
    var dot = document.createElement("button");
    dot.className = "about-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", "Go to photo " + (i + 1));
    dot.addEventListener("click", function () { goTo(i); });
    dotsWrap.appendChild(dot);
  });

  var dots = Array.from(dotsWrap.querySelectorAll(".about-dot"));

  function goTo(index) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");

    current = (index + total) % total;

    slides[current].classList.add("active");
    dots[current].classList.add("active");

    if (counter) counter.textContent = (current + 1) + " / " + total;
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(next, INTERVAL_MS);
  }

  startTimer();

  // Pause on hover
  slideshow.addEventListener("mouseenter", function () { clearInterval(timer); });
  slideshow.addEventListener("mouseleave", startTimer);

  // Button events
  if (prevBtn) prevBtn.addEventListener("click", function () { prev(); startTimer(); });
  if (nextBtn) nextBtn.addEventListener("click", function () { next(); startTimer(); });

  // Keyboard navigation
  slideshow.setAttribute("tabindex", "0");
  slideshow.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft")  { prev(); startTimer(); }
    if (e.key === "ArrowRight") { next(); startTimer(); }
  });
})();
