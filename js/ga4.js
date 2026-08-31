/*
  ga4.js — Googleアナリティクス4（GA4）の初期化とイベント計測

  なぜ外部ファイルにしているか
    本サイトのCSPは script-src 'self' で、インラインスクリプトを許していない。
    GA4の定型コードはインラインで書く例が多いが、それをやると
    'unsafe-inline' が必要になり、サイト全体のXSS耐性が落ちる。
    設定コードをこのファイルに逃がすことで、'unsafe-inline' なしで動かしている。
    （gtag.js 本体だけ googletagmanager.com からの読み込みを許可している）

  計測ID: G-MV31MNHJTQ（P.FORWARD 公式サイト）
  設置日: 2026-08-31
*/
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-MV31MNHJTQ');

/*
  開業前サイトなので、「どれだけ関心を持たれたか」を見たい。
  ページビューだけでは分からないため、行動が現れる2つを拾う。
    reservation_click … 予約・問い合わせボタンが押された
    tel_click         … 電話番号がタップされた（スマホからの問い合わせ意欲）
*/
document.addEventListener('DOMContentLoaded', function () {
  var toContact = document.querySelectorAll('a[href$="contact.html"]');
  for (var i = 0; i < toContact.length; i++) {
    (function (a) {
      a.addEventListener('click', function () {
        gtag('event', 'reservation_click', {
          link_text: (a.textContent || '').trim(),
          page_path: location.pathname
        });
      });
    })(toContact[i]);
  }

  var tels = document.querySelectorAll('a[href^="tel:"]');
  for (var j = 0; j < tels.length; j++) {
    (function (a) {
      a.addEventListener('click', function () {
        gtag('event', 'tel_click', {
          page_path: location.pathname
        });
      });
    })(tels[j]);
  }
});
