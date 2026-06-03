/* ===================================================================
   株式会社 P.FORWARD  オフィシャルサイト  -  main.js
=================================================================== */
(function () {
  "use strict";

  /* ヘッダー：スクロールで白背景に切替 */
  var header = document.getElementById("header");
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 60);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* モバイル：ハンバーガーメニューの開閉 */
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primaryNav");
  if (navToggle && primaryNav) {
    var setOpen = function (open) {
      header.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
      document.body.style.overflow = open ? "hidden" : "";
    };
    navToggle.addEventListener("click", function () {
      setOpen(!header.classList.contains("nav-open"));
    });
    /* リンクをタップしたら閉じる */
    primaryNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    /* Escキーで閉じる */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ヒーロー：背景スライドのフェード自動切替（6秒ごと・フェード2.4秒） */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero__slide"));
  if (slides.length > 1) {
    var idx = 0;
    setInterval(function () {
      slides[idx].classList.remove("active");
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add("active");
    }, 6000);
  }

  /* ページトップボタン */
  var pagetop = document.getElementById("pagetop");
  if (pagetop) {
    window.addEventListener("scroll", function () {
      pagetop.classList.toggle("show", window.scrollY > 300);
    }, { passive: true });
    pagetop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* スクロールで要素をふわっと表示 */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("in");
    });
  }
})();
