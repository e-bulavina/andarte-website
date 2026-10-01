(function () {
  "use strict";

  const CONTACT_EMAIL = "andarte.glass@gmail.com";
  const IMG_BASE = "images/";

  /* ---------- helpers ---------- */
  function mailto(subject, body) {
    return "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  /* ---------- mobile nav ---------- */
  const hamburger = document.querySelector(".hamburger");
  const navList = document.querySelector(".nav-list");
  if (hamburger && navList) {
    hamburger.addEventListener("click", () => {
      const open = navList.classList.toggle("is-open");
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navList.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => navList.classList.remove("is-open"))
    );
  }

  /* ---------- active link on scroll ---------- */
  const navLinks = Array.from(document.querySelectorAll(".nav-list a[href^='#']"));
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  function updateActiveLink() {
    let current = sections[0];
    const y = window.scrollY + 120;
    sections.forEach((s) => { if (s.offsetTop <= y) current = s; });
    navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + current.id));
  }
  if (sections.length) {
    window.addEventListener("scroll", updateActiveLink, { passive: true });
    updateActiveLink();
  }

  /* ---------- reveal on scroll ---------- */
  const revealTargets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealTargets.length) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    revealTargets.forEach((t) => io.observe(t));
  } else {
    revealTargets.forEach((t) => t.classList.add("is-visible"));
  }

  /* ---------- lightbox ---------- */
  const lightbox = el("div", "lightbox");
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.innerHTML =
    '<button class="lightbox-close" aria-label="Zatvori">&times;</button>' +
    '<button class="lightbox-prev" aria-label="Prethodna slika">&#10094;</button>' +
    '<img alt="" />' +
    '<button class="lightbox-next" aria-label="Sljedeća slika">&#10095;</button>' +
    '<div class="lightbox-counter"></div>';
  document.body.appendChild(lightbox);
  const lbImg = lightbox.querySelector("img");
  const lbCounter = lightbox.querySelector(".lightbox-counter");
  let lbSet = [];
  let lbIndex = 0;

  function openLightbox(images, index, alt) {
    lbSet = images;
    lbIndex = index;
    render();
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  function render() {
    lbImg.src = IMG_BASE + lbSet[lbIndex];
    lbCounter.textContent = lbSet.length > 1 ? (lbIndex + 1) + " / " + lbSet.length : "";
    const multi = lbSet.length > 1;
    lightbox.querySelector(".lightbox-prev").style.display = multi ? "flex" : "none";
    lightbox.querySelector(".lightbox-next").style.display = multi ? "flex" : "none";
  }
  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  lightbox.querySelector(".lightbox-prev").addEventListener("click", () => { lbIndex = (lbIndex - 1 + lbSet.length) % lbSet.length; render(); });
  lightbox.querySelector(".lightbox-next").addEventListener("click", () => { lbIndex = (lbIndex + 1) % lbSet.length; render(); });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") { lbIndex = (lbIndex - 1 + lbSet.length) % lbSet.length; render(); }
    if (e.key === "ArrowRight") { lbIndex = (lbIndex + 1) % lbSet.length; render(); }
  });

  function wireGalleryLink(anchor, images, index) {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      openLightbox(images, index);
    });
  }

  /* ---------- gallery lightboxes ----------
     All artwork cards, the custom-project gallery and the hero/about photos
     are plain static <a href="images/....jpg"> links in the HTML, so images
     always show and are clickable (open the photo directly) even if this
     script fails to load. Where present, we upgrade the click into the
     in-page lightbox below. */
  document.querySelectorAll("[data-gallery]").forEach((a) => {
    const images = a.getAttribute("data-gallery").split(",").map((s) => s.trim()).filter(Boolean);
    const index = parseInt(a.getAttribute("data-gallery-index") || "0", 10) || 0;
    wireGalleryLink(a, images, index);
  });

  document.querySelectorAll("[data-lightbox-single]").forEach((a) => {
    const file = a.getAttribute("href").split("/").pop();
    wireGalleryLink(a, [file], 0);
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
