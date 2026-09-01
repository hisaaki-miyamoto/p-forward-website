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

  function open() {
    group.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
  }
  function close() {
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
