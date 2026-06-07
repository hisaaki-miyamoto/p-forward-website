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

  /* グループ3社：3枠を線で結び中央スペースにリングを配置（PC）。
     スマホでは同じリングをヒーロー文章ブロックの下へ移動して表示。 */
  (function groupLinks() {
    var roles = document.querySelector(".group .roles");
    var svg = document.querySelector(".group .roles__links");
    var ring = document.querySelector(".ring3d");
    var hero = document.querySelector(".hero");
    var heroScroll = document.querySelector(".hero__scroll");
    if (!roles || !svg) return;
    var cards = roles.querySelectorAll(".role");
    if (cards.length < 3) return;
    var SVGNS = "http://www.w3.org/2000/svg";

    function center(el) {
      return { x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 };
    }

    function layout() {
      var mobile = window.innerWidth <= 860;

      if (mobile) {
        // スマホ：連結線は隠し、リングはヒーロー（文章の下）へ移動
        svg.style.display = "none";
        if (ring) {
          if (hero && ring.parentElement !== hero) {
            hero.insertBefore(ring, heroScroll || null);
          }
          ring.style.left = "";
          ring.style.top = "";
          ring.style.display = "";
        }
        if (window.__pfTorusResize) window.__pfTorusResize();
        return;
      }

      // PC：リングをグループ枠内に戻し、3枠を線で連結＋中央へ配置
      svg.style.display = "";
      if (ring) {
        if (ring.parentElement !== roles) roles.appendChild(ring);
        ring.style.display = "";
      }

      var W = roles.clientWidth, H = roles.clientHeight;
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);

      var p = [center(cards[0]), center(cards[1]), center(cards[2])]; // ①②③の中心
      var pairs = [[0, 1], [1, 2], [0, 2]];
      svg.innerHTML = "";
      pairs.forEach(function (pr) {
        var ln = document.createElementNS(SVGNS, "line");
        ln.setAttribute("x1", p[pr[0]].x); ln.setAttribute("y1", p[pr[0]].y);
        ln.setAttribute("x2", p[pr[1]].x); ln.setAttribute("y2", p[pr[1]].y);
        svg.appendChild(ln);
      });

      // リングは「②の下端」と「①③の上端」の中間（中央の空きスペース）へ
      if (ring) {
        var self = cards[1], bottom = cards[0];
        var selfBottom = self.offsetTop + self.offsetHeight;
        var bottomTop = bottom.offsetTop;
        ring.style.left = (W / 2) + "px";
        ring.style.top = ((selfBottom + bottomTop) / 2) + "px";
      }
      if (window.__pfTorusResize) window.__pfTorusResize();
    }

    layout();
    window.addEventListener("resize", layout, { passive: true });
    // フォント・画像読み込み後のズレ対策
    window.addEventListener("load", layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  })();

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
