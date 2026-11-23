(function () {
  "use strict";

  const CONTACT_EMAIL = "andarte.glass@gmail.com";
  const IMG_BASE = "images/";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function mailto(subject, body) {
    return "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  /* ---------- mobile nav ---------- */
  const hamburger = document.querySelector(".hamburger");
  const navList = document.querySelector(".nav-list");
  if (hamburger && navList) {
    hamburger.addEventListener("click", () => {
      const open = navList.classList.toggle("is-open");
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
      hamburger.setAttribute("aria-label", open ? "Zatvori izbornik" : "Otvori izbornik");
      document.body.style.overflow = open ? "hidden" : "";
    });
  }

  /* ---------- lightbox ---------- */
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Pregled fotografije");
  lightbox.innerHTML =
    '<button class="lightbox-close" aria-label="Zatvori">&times;</button>' +
    '<button class="lightbox-prev" aria-label="Prethodna slika">&#8249;</button>' +
    '<img alt="" />' +
    '<button class="lightbox-next" aria-label="Sljedeća slika">&#8250;</button>' +
    '<div class="lightbox-counter"></div>';
  document.body.appendChild(lightbox);
  const lbImg = lightbox.querySelector("img");
  const lbCounter = lightbox.querySelector(".lightbox-counter");
  let lbSet = [], lbIndex = 0, lbReturnFocus = null;

  function renderLightbox() {
    lbImg.src = IMG_BASE + lbSet[lbIndex];
    const multi = lbSet.length > 1;
    lbCounter.textContent = multi ? (lbIndex + 1) + " / " + lbSet.length : "";
    lightbox.querySelector(".lightbox-prev").style.display = multi ? "flex" : "none";
    lightbox.querySelector(".lightbox-next").style.display = multi ? "flex" : "none";
  }
  function openLightbox(images, index) {
    lbSet = images; lbIndex = index; lbReturnFocus = document.activeElement;
    renderLightbox();
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
    lightbox.querySelector(".lightbox-close").focus();
  }
  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lbReturnFocus) lbReturnFocus.focus();
  }
  function step(d) { lbIndex = (lbIndex + d + lbSet.length) % lbSet.length; renderLightbox(); }
  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", () => step(-1));
  lightbox.querySelector(".lightbox-next").addEventListener("click", () => step(1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  document.querySelectorAll("[data-gallery]").forEach((a) => {
    const images = a.getAttribute("data-gallery").split(",").map((s) => s.trim()).filter(Boolean);
    const index = parseInt(a.getAttribute("data-gallery-index") || "0", 10) || 0;
    a.addEventListener("click", (e) => { e.preventDefault(); openLightbox(images, index); });
  });
  document.querySelectorAll("[data-lightbox-single]").forEach((a) => {
    const file = a.getAttribute("href").split("/").pop();
    a.addEventListener("click", (e) => { e.preventDefault(); openLightbox([file], 0); });
  });

  /* ---------- project slider ---------- */
  document.querySelectorAll("[data-slider]").forEach((slider) => {
    const track = slider.querySelector(".slider-track");
    const slides = Array.from(slider.querySelectorAll(".slide"));
    const dots = Array.from(slider.querySelectorAll(".dot"));
    const count = slider.querySelector(".slider-count");
    const viewport = slider.querySelector(".slider-viewport");
    const files = (slider.getAttribute("data-gallery-list") || "").split(",");
    let i = 0, timer = null, paused = false;

    function go(n) {
      i = (n + slides.length) % slides.length;
      track.style.transform = "translateX(" + (-100 * i) + "%)";
      dots.forEach((d, k) => {
        d.classList.toggle("is-active", k === i);
        d.setAttribute("aria-current", k === i ? "true" : "false");
      });
      slides.forEach((s, k) => s.setAttribute("aria-hidden", k === i ? "false" : "true"));
      if (count) count.textContent = (i + 1) + " / " + slides.length;
      // warm up the next image so it is ready when it slides in
      const nextImg = slides[(i + 1) % slides.length].querySelector("img");
      if (nextImg) nextImg.loading = "eager";
    }
    function restart() {
      clearInterval(timer);
      if (reduceMotion) return;
      timer = setInterval(() => { if (!paused && !lightbox.classList.contains("is-open")) go(i + 1); }, 5000);
    }

    slider.querySelector(".prev").addEventListener("click", () => { go(i - 1); restart(); });
    slider.querySelector(".next").addEventListener("click", () => { go(i + 1); restart(); });
    dots.forEach((d, k) => d.addEventListener("click", () => { go(k); restart(); }));
    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { go(i - 1); restart(); }
      if (e.key === "ArrowRight") { go(i + 1); restart(); }
    });
    slider.addEventListener("mouseenter", () => { paused = true; });
    slider.addEventListener("mouseleave", () => { paused = false; });
    slider.addEventListener("focusin", () => { paused = true; });
    slider.addEventListener("focusout", () => { paused = false; });

    // swipe
    let startX = null, moved = false;
    viewport.addEventListener("pointerdown", (e) => { startX = e.clientX; moved = false; });
    viewport.addEventListener("pointermove", (e) => { if (startX !== null && Math.abs(e.clientX - startX) > 10) moved = true; });
    viewport.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX; startX = null;
      if (Math.abs(dx) > 45) { go(dx < 0 ? i + 1 : i - 1); restart(); }
    });

    // click a photo to see it large
    slides.forEach((s, k) => s.addEventListener("click", (e) => {
      if (moved || e.target.closest(".slider-btn")) return;
      openLightbox(files, k);
    }));

    go(0);
    restart();
  });

  /* ---------- contact form -> mailto ---------- */
  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(contactForm);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const topic = (data.get("topic") || "").toString().trim();
      const message = (data.get("message") || "").toString().trim();
      const subject = (topic ? topic + " — " : "") + "Upit s web stranice" + (name ? " (" + name + ")" : "");
      const body = "Ime: " + name + "\nEmail: " + email + "\n\n" + message;
      window.location.href = mailto(subject, body);
    });
  }

  /* ---------- footer year ---------- */
  const yearEl = document.querySelector("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

/* ---------- liquid glass: the cursor smudges the hero glass; it melts back very slowly ---------- */
(function () {
  const hero = document.querySelector(".hero");
  const canvas = hero && hero.querySelector(".hero-liquid");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
  if (!gl) return; // the plain photo underneath stays visible

  const P = "#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n";
  // displacement is stored in a normal RGBA texture: two bytes per axis for smooth, precise values
  const CODEC =
    "vec2 dec(vec4 c){ return (vec2(c.r + c.g / 255.0, c.b + c.a / 255.0) - 0.5) * 0.5; }\n" +
    "vec4 enc(vec2 d){ vec2 v = clamp(d * 2.0 + 0.5, 0.0, 0.99999); vec2 hi = floor(v * 255.0) / 255.0; vec2 lo = fract(v * 255.0); return vec4(hi.x, lo.x, hi.y, lo.y); }\n";
  const VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";

  // pass 1: add one stroke of the "finger" to the stored warp
  const BRUSH = P + CODEC + [
    "uniform sampler2D u_prev; uniform vec2 u_res; uniform vec2 u_p; uniform vec2 u_v; uniform float u_r; uniform float u_keep;",
    "void main(){",
    "  vec2 st = gl_FragCoord.xy / u_res;",
    "  vec2 uv = vec2(st.x, 1.0 - st.y);",
    "  vec2 d = dec(texture2D(u_prev, st)) * u_keep;",
    "  vec2 q = uv - u_p; q.x *= u_res.x / u_res.y;",
    "  float g = exp(-dot(q, q) / u_r);",
    "  d -= u_v * g * 0.9;",
    "  float L = length(d); if (L > 0.07) d *= 0.07 / L;",
    "  if (u_keep < 0.99999) { float L2 = length(d); d *= max(L2 - 0.000012, 0.0) / max(L2, 1e-6); }", // melting: also a tiny steady pull so it fully returns
    "  gl_FragColor = enc(d);",
    "}"].join("\n");

  // pass 2: draw the photo through the warp
  const SHOW = P + CODEC + [
    "uniform sampler2D u_tex; uniform sampler2D u_disp; uniform vec2 u_res; uniform vec2 u_scale; uniform vec2 u_center; uniform float u_time; uniform float u_motion;",
    "void main(){",
    "  vec2 st = gl_FragCoord.xy / u_res;",
    "  vec2 uv = vec2(st.x, 1.0 - st.y);",
    "  vec2 disp = dec(texture2D(u_disp, st));",
    "  disp += 0.0009 * vec2(sin(uv.y * 4.0 + u_time * 0.22), cos(uv.x * 3.5 + u_time * 0.19));",
    "  vec2 iuv = (uv + disp - 0.5) * u_scale + u_center;",
    "  float amt = length(disp);",
    "  vec2 split = (disp / (amt + 1e-5)) * min(amt, 0.015) * 0.12 * u_motion * u_scale;",
    "  vec3 col = vec3(texture2D(u_tex, iuv + split).r, texture2D(u_tex, iuv).g, texture2D(u_tex, iuv - split).b);",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"].join("\n");

  function program(fsrc) {
    const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
    const vs = mk(gl.VERTEX_SHADER, VERT), fs = mk(gl.FRAGMENT_SHADER, fsrc);
    if (!vs || !fs) return null;
    const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs);
    gl.bindAttribLocation(pr, 0, "p"); gl.linkProgram(pr);
    return gl.getProgramParameter(pr, gl.LINK_STATUS) ? pr : null;
  }
  const brushProg = program(BRUSH), showProg = program(SHOW);
  if (!brushProg || !showProg) return;
  const U = (pr, n) => gl.getUniformLocation(pr, n);
  const B = { prev: U(brushProg, "u_prev"), res: U(brushProg, "u_res"), p: U(brushProg, "u_p"), v: U(brushProg, "u_v"), r: U(brushProg, "u_r"), keep: U(brushProg, "u_keep") };
  const S = { tex: U(showProg, "u_tex"), disp: U(showProg, "u_disp"), res: U(showProg, "u_res"), scale: U(showProg, "u_scale"),
              center: U(showProg, "u_center"), time: U(showProg, "u_time"), motion: U(showProg, "u_motion") };

  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  function makeTex(w, h, data, filter) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    if (data instanceof HTMLImageElement) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, data);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    return t;
  }

  let photo = null, imgW = 1, imgH = 1, W = 0, H = 0;
  let disp = [], fbo = [], cur = 0;

  function resetWarp() {
    // a blank warp: every value encodes "no movement"
    const data = new Uint8Array(W * H * 4);
    for (let i = 0; i < data.length; i += 4) { data[i] = 127; data[i + 1] = 128; data[i + 2] = 127; data[i + 3] = 128; }
    disp.forEach((t) => gl.deleteTexture(t)); fbo.forEach((f) => gl.deleteFramebuffer(f));
    disp = [makeTex(W, H, data, gl.NEAREST), makeTex(W, H, data, gl.NEAREST)];
    fbo = disp.map((t) => { const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); return f; });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    cur = 0;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (w === W && h === H) return;
    W = canvas.width = w; H = canvas.height = h;
    resetWarp();
    const mobile = window.innerWidth <= 720;
    const fx = mobile ? 0.26 : 0.22, fy = mobile ? 0.60 : 0.62;
    const ca = w / h, ia = imgW / imgH;
    let sx = 1, sy = 1;
    if (ca > ia) sy = ia / ca; else sx = ca / ia;
    gl.useProgram(showProg);
    gl.uniform2f(S.scale, sx, sy);
    gl.uniform2f(S.center, 0.5 * sx + fx * (1 - sx), 0.5 * sy + fy * (1 - sy));
  }

  function stroke(x, y, vx, vy, keep) {
    const len = Math.hypot(vx, vy), max = 0.02;
    if (len > max) { vx *= max / len; vy *= max / len; }
    gl.useProgram(brushProg);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[1 - cur]);
    gl.viewport(0, 0, W, H);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, disp[cur]);
    gl.uniform1i(B.prev, 0);
    gl.uniform2f(B.res, W, H); gl.uniform2f(B.p, x, y); gl.uniform2f(B.v, vx, vy); gl.uniform1f(B.r, 0.005); gl.uniform1f(B.keep, keep === undefined ? 1 : keep);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    cur = 1 - cur;
  }

  let motion = 0;
  function show(time) {
    gl.useProgram(showProg);
    gl.viewport(0, 0, W, H);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, photo); gl.uniform1i(S.tex, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, disp[cur]); gl.uniform1i(S.disp, 1);
    gl.uniform2f(S.res, W, H); gl.uniform1f(S.time, time); gl.uniform1f(S.motion, motion);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  const img = new Image();
  img.src = "images/hero-strip-1.jpg";
  img.onload = () => {
    imgW = img.naturalWidth; imgH = img.naturalHeight;
    photo = makeTex(0, 0, img, gl.LINEAR);
    resize(); show(performance.now() / 1000);
    canvas.classList.add("is-ready");
    start();
  };
  window.addEventListener("resize", () => { if (photo) resize(); });

  let px = null, py = null, qx = null, qy = null, vx = 0, vy = 0, moved = false;
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    px = (e.clientX - r.left) / r.width; py = (e.clientY - r.top) / r.height;
    if (qx === null) { qx = px; qy = py; }
    moved = true;
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { px = null; py = null; qx = null; qy = null; });
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // the warp melts back very slowly: about 90% gone after half a minute
  const MELT_PER_SECOND = 0.925;
  let last = 0, lastPush = 0, running = false, visible = true, auto = 0;
  function frame(t) {
    const time = t / 1000;
    const dt = last ? Math.min(time - last, 0.1) : 0.016;
    motion *= Math.pow(0.94, dt * 60);
    if (moved && px !== null && time - lastPush >= 0.025) {
      vx = vx * 0.6 + (px - qx) * 0.4 * 0.45; vy = vy * 0.6 + (py - qy) * 0.4 * 0.45;
      // fill the gap between samples so fast movements still leave a smooth line
      const steps = Math.min(8, Math.max(1, Math.ceil(Math.hypot(px - qx, py - qy) / 0.012)));
      for (let k = 1; k <= steps; k++) stroke(qx + (px - qx) * k / steps, qy + (py - qy) * k / steps, vx / steps * 1.6, vy / steps * 1.6);
      motion = Math.min(1, motion + 0.5);
      qx = px; qy = py; lastPush = time; moved = false;
    } else if (!finePointer && auto < 14 && time - lastPush >= 0.12) {
      // phones: one slow, unseen stroke through the glass after the page opens
      const s = auto / 14, x = 0.48 + 0.4 * s, y = 0.62 - 0.34 * s + 0.06 * Math.sin(s * 6.0);
      stroke(x, y, 0.006, -0.004); auto++; lastPush = time; motion = 0.6;
    }
    // melt a tiny amount every frame so the glass flows back smoothly
    stroke(-10, -10, 0, 0, Math.pow(MELT_PER_SECOND, dt));
    last = time;
    show(time);
  }
  function loop(t) { if (!running) return; frame(t); requestAnimationFrame(loop); }
  function start() { if (!running && visible && photo) { running = true; requestAnimationFrame(loop); } }
  function stop() { running = false; }
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; visible ? start() : stop(); }).observe(hero);
  document.addEventListener("visibilitychange", () => { document.hidden ? stop() : start(); });
})();
