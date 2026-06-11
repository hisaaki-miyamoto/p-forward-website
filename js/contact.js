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
})();
