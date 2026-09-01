/*
  ku-taro-nav.js — ヘッダー「グループ店舗」のドロップダウン

  なぜ別ファイルにしているか
    js/main.js は index.html と共用のため、このページ専用の挙動は分けている。

  開き方の使い分け
    PC     … CSSの :hover で開く（このJSがなくても開く）
    キーボード・スマホ … ホバーできないので、クリックで .is-open を付け外しする
  つまりJSは「ホバーできない人のための補助」であり、JSが動かなくても
  PCでは従来どおり開く。
*/
(function () {
  var group = document.querySelector('.nav-group');
  if (!group) return;

  var btn = group.querySelector('.nav-group__btn');
  if (!btn) return;

  /*
    スマホ（768px以下）ではCSSがメニューを開いたまま表示する。
    そこで aria-expanded を持たせたままだと「閉じている」と読み上げられ、
    見えている状態と食い違う。常時表示の幅では開閉の属性ごと外し、
    ただの見出しとして扱う。（2026-09-01 Codex指摘）
  */
  var alwaysOpen = window.matchMedia('(max-width:768px)');

  function syncMode() {
    if (alwaysOpen.matches) {
      btn.removeAttribute('aria-expanded');
      btn.removeAttribute('aria-haspopup');
      group.classList.remove('is-open');
    } else {
      btn.setAttribute('aria-haspopup', 'true');
      btn.setAttribute('aria-expanded', group.classList.contains('is-open') ? 'true' : 'false');
    }
  }
  syncMode();
  if (alwaysOpen.addEventListener) {
    alwaysOpen.addEventListener('change', syncMode);
  } else if (alwaysOpen.addListener) {
    alwaysOpen.addListener(syncMode);
  }

  function open() {
    if (alwaysOpen.matches) return;   // 常時表示の幅では何もしない
    group.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
  }
  function close() {
    if (alwaysOpen.matches) return;
    group.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  }
  function toggle() {
    if (group.classList.contains('is-open')) { close(); } else { open(); }
  }

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  });

  // メニューの外を触ったら閉じる
  document.addEventListener('click', function (e) {
    if (!group.contains(e.target)) close();
  });

  // Escape で閉じて、ボタンへ戻す（キーボード操作の行き止まりを作らない）
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && group.classList.contains('is-open')) {
      close();
      btn.focus();
    }
  });

  // 店舗を選んだら閉じる（スマホのドロワーで開いたままにならないように）
  var links = group.querySelectorAll('.nav-group__menu a');
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function () { close(); });
  }
})();
