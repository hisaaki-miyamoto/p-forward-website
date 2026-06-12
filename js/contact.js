/* ===================================================================
   株式会社 P.FORWARD  お問い合わせフォーム  -  contact.js
   Formspree へ AJAX 送信し、ページ遷移なしで結果を表示する。
=================================================================== */
(function () {
  "use strict";

  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  var submit = document.getElementById("formSubmit");
  if (!form || !status || !submit) return;

  function setStatus(msg, type) {
    status.textContent = msg;
    status.className = "cform__status" + (type ? " is-" + type : "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // 未設定（プレースホルダ）のままなら送信せず案内
    if (form.action.indexOf("YOUR_FORM_ID") !== -1) {
      setStatus("フォームの送信先が未設定です。サイト管理者へご連絡ください。", "error");
      return;
    }

    submit.disabled = true;
    setStatus("送信しています…", "");

    var data = new FormData(form);
    fetch(form.action, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" }
    })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          setStatus("お問い合わせを送信しました。ご連絡ありがとうございます。担当より追ってご連絡いたします。", "success");
        } else {
          return res.json().then(function (json) {
            var msg =
              json && json.errors && json.errors.length
                ? json.errors.map(function (x) { return x.message; }).join(" / ")
                : "送信に失敗しました。お手数ですが時間をおいて再度お試しください。";
            setStatus(msg, "error");
            submit.disabled = false;
          });
        }
      })
      .catch(function () {
        setStatus("通信エラーが発生しました。お手数ですが時間をおいて再度お試しください。", "error");
        submit.disabled = false;
      });
  });

  /* 背景：写真スライドのフェード自動切替（トップと同じ・6秒ごと） */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero__slide"));
  if (slides.length > 1) {
    var idx = 0;
    setInterval(function () {
      slides[idx].classList.remove("active");
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add("active");
    }, 6000);
  }

  /* 背景：海の泡（トップと同じ。全画面の固定キャンバスとして描画） */
  (function bubbles() {
    var canvas = document.querySelector(".hero__bubbles");
    if (!canvas) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, parts = [], running = true, last = performance.now();
    var pointer = { x: 0, y: 0, active: false };
    var RANGE = 200;

    function rnd(a, b) { return a + Math.random() * (b - a); }
    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function make(initial) {
      return {
        bx: rnd(0, W), y: initial ? rnd(0, H) : H + rnd(0, 40),
        r: rnd(3, 10), sp: rnd(8, 24), sway: rnd(8, 20),
        phase: rnd(0, Math.PI * 2), op: rnd(0.10, 0.22),
        ox: 0, oy: 0
      };
    }
    function init() {
      parts = [];
      var n = Math.max(6, Math.min(12, Math.round(W / 120)));
      for (var i = 0; i < n; i++) parts.push(make(true));
    }
    function frame(now) {
      if (!running) return;
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y -= p.sp * dt; p.phase += dt;
        if (p.y < -12) { parts[i] = make(false); continue; }
        var x = p.bx + Math.sin(p.phase) * p.sway;
        if (pointer.active) {
          var dx = (x + p.ox) - pointer.x, dy = (p.y + p.oy) - pointer.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < RANGE && d > 0.01) {
            var f = (1 - d / RANGE) * 4;
            p.ox += (dx / d) * f; p.oy += (dy / d) * f;
          }
        }
        p.ox *= 0.88; p.oy *= 0.88;
        var rx = x + p.ox, ry = p.y + p.oy;
        var body = ctx.createRadialGradient(rx, ry, p.r * 0.1, rx, ry, p.r);
        body.addColorStop(0, "rgba(255,255,255,0)");
        body.addColorStop(0.72, "rgba(255,255,255," + (p.op * 0.12) + ")");
        body.addColorStop(0.93, "rgba(255,255,255," + p.op + ")");
        body.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = body;
        ctx.beginPath(); ctx.arc(rx, ry, p.r, 0, Math.PI * 2); ctx.fill();
        var hx = rx - p.r * 0.34, hy = ry - p.r * 0.34, hr = p.r * 0.5;
        var hl = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
        hl.addColorStop(0, "rgba(255,255,255," + Math.min(0.85, p.op * 3.5) + ")");
        hl.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = hl;
        ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    function setPointer(e) {
      pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true;
    }
    resize(); init();
    window.addEventListener("resize", function () { resize(); init(); }, { passive: true });
    window.addEventListener("mousemove", setPointer, { passive: true });
    document.addEventListener("mouseleave", function () { pointer.active = false; }, { passive: true });
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) { last = performance.now(); requestAnimationFrame(frame); }
    });
    requestAnimationFrame(frame);
  })();
})();
