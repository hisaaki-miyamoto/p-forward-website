/* ===================================================================
   株式会社 P.FORWARD  -  ヒーロー 3Dガラストーラス（WebGL / Three.js）
   CARTA ZERO 風：本物のガラス質トーラスが対角線軸でゆっくり回転
=================================================================== */
(function () {
  "use strict";

  if (typeof THREE === "undefined") return;

  var spinner = document.querySelector(".hero__spinner");
  var canvas = document.querySelector(".torus-gl");
  if (!spinner || !canvas) return;

  // 端末がWebGLに対応していなければ何もしない（背景写真のみ表示）
  try {
    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false
    });
  } catch (e) {
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 6.1);

  /* ---- ガラスの艶を出す高コントラスト・スタジオ照明風 環境マップ ----
     暗い背景に明るいソフトボックス（帯状の光源）を配置し、
     鏡面反射でくっきりした光沢が走るようにする ---- */
  function makeEnvTexture() {
    var W = 1024, H = 512;
    var c = document.createElement("canvas");
    c.width = W; c.height = H;
    var g = c.getContext("2d");

    // 背景：上が少し明るく、下は暗い（床と天井のニュアンス）
    var bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0.0, "#7d8ea4");
    bg.addColorStop(0.5, "#34465c");
    bg.addColorStop(1.0, "#0b121c");
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    // 明るいソフトボックス（縦帯）。ソフトな縁取りで艶のある反射に
    function softbox(cx, cy, w, h, a, tint) {
      g.save();
      var grd = g.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
      grd.addColorStop(0.0, "rgba(" + tint + ",0)");
      grd.addColorStop(0.5, "rgba(" + tint + "," + a + ")");
      grd.addColorStop(1.0, "rgba(" + tint + ",0)");
      g.fillStyle = grd;
      g.fillRect(cx - w / 2, cy - h / 2, w, h);
      g.restore();
    }
    // 主光源（大きく強い白）
    softbox(250, H * 0.42, 150, 360, 1.0, "255,255,255");
    // 補助光（白・細め）
    softbox(560, H * 0.40, 70, 300, 0.95, "255,255,255");
    softbox(760, H * 0.5, 90, 340, 0.8, "245,250,255");
    // ブランドのゴールドをほんのり反射に
    softbox(900, H * 0.45, 60, 260, 0.55, "230,200,140");
    // 上部の明るいライン（リム反射用）
    var top = g.createLinearGradient(0, 0, 0, 90);
    top.addColorStop(0, "rgba(255,255,255,0.85)");
    top.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = top; g.fillRect(0, 0, W, 90);

    var tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  var pmrem = new THREE.PMREMGenerator(renderer);
  var envRT = pmrem.fromEquirectangular(makeEnvTexture());
  scene.environment = envRT.texture;

  /* ---- 鏡面に「周りの景色（ヒーローの海・空）」を映り込ませる ----
     ヒーロー写真を反射環境マップとして読み込み、本物の鏡のように周囲を映す ---- */
  (function loadSceneryEnv() {
    var loader = new THREE.ImageLoader();
    loader.setCrossOrigin("anonymous");
    loader.load("images/hero-1.jpg", function (img) {
      var W = 1024, H = 512;
      var c = document.createElement("canvas");
      c.width = W; c.height = H;
      var g = c.getContext("2d");
      // 写真を環境全体に引き伸ばして配置（左右に2回並べて繋ぎ目を緩和）
      g.drawImage(img, 0, 0, W * 0.5, H);
      g.drawImage(img, W * 0.5, 0, W * 0.5, H);
      // 明るい映り込み（ハイライト）を少し足してクローム感を強調
      g.globalCompositeOperation = "lighter";
      function blob(x, y, r, a) {
        var rg = g.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, "rgba(255,255,255," + a + ")");
        rg.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = rg;
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
      blob(180, 90, 80, 0.6);
      blob(700, 70, 60, 0.5);
      var tex = new THREE.CanvasTexture(c);
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.encoding = THREE.sRGBEncoding;
      var rt = pmrem.fromEquirectangular(tex);
      scene.environment = rt.texture;   // 映り込みを景色に差し替え
      tex.dispose();
    });
  })();

  /* ---- ガラス素材 ---- */
  var material = new THREE.MeshPhysicalMaterial({
    color: 0xd2d7df,          // シルバー
    metalness: 1.0,           // 完全な金属＝鏡（ミラー）
    roughness: 0.0,           // 0＝完全鏡面（周囲をくっきり映す）
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    envMapIntensity: 1.25,    // 金属の映り込み強度
    flatShading: true,        // 面を平らに＝稜線（エッジ）を立てる
    transparent: true,        // 半透明にして背景をうっすら透かす
    opacity: 0.3,
    depthWrite: false         // 自己重なりの透過を自然に
  });

  /* ---- トーラス形状：縁を太く・穴を狭く、断面6分割でカクカクに ---- */
  var geometry = new THREE.TorusGeometry(1.45, 0.34, 6, 120);
  var torus = new THREE.Mesh(geometry, material);
  torus.scale.set(1, 1, 0.6);   // 奥行きを潰して平たい帯状に（膨らみ抑制）
  scene.add(torus);

  /* ---- ライティング（反射ハイライト用） ---- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  var dir1 = new THREE.DirectionalLight(0xffffff, 1.1);
  dir1.position.set(4, 5, 6);
  scene.add(dir1);
  var dir2 = new THREE.DirectionalLight(0xcfe0ff, 0.6);
  dir2.position.set(-5, -3, 2);
  scene.add(dir2);

  /* ---- サイズ調整（spinnerの正方形枠にフィット） ---- */
  function resize() {
    var w = spinner.clientWidth || 1;
    var h = spinner.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  /* ---- 回転：水平軸まわりに前転（24秒で1回転）しつつ、
     正面を向くたびに傾き軸が「右上45°」⇄「左上45°」と入れ替わる ----
     ・theta：前転角（0→2π）。0と180で正面、90と270で真横
     ・psi  ：画面奥行き軸まわりの傾き。45°×cos(theta) で
              theta=0→+45°（右上軸） / theta=180→-45°（左上軸） */
  var AXIS_X = new THREE.Vector3(1, 0, 0);   // 前転の軸（水平）
  var AXIS_Z = new THREE.Vector3(0, 0, 1);   // 画面手前向き＝傾きの軸
  var qX = new THREE.Quaternion();
  var qZ = new THREE.Quaternion();
  var LEAN = Math.PI / 4;            // ±45°
  var speed = (Math.PI * 2) / 24;    // rad/秒（24秒で一周）
  var theta = 0.35;                  // 初期角（最初から立体的に見せる）
  var last = performance.now();
  var visible = true;

  // タブが非表示の間は描画を止める（負荷軽減）
  document.addEventListener("visibilitychange", function () {
    visible = !document.hidden;
    if (visible) { last = performance.now(); requestAnimationFrame(loop); }
  });

  function loop(now) {
    if (!visible) return;
    var dt = (now - last) / 1000;
    last = now;
    theta += speed * dt;
    var psi = LEAN * Math.cos(theta);          // 正面ごとに +45°⇄-45°
    qX.setFromAxisAngle(AXIS_X, theta);
    qZ.setFromAxisAngle(AXIS_Z, psi);
    torus.quaternion.copy(qZ).multiply(qX);    // 傾き(Z) の枠内で前転(X)
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
