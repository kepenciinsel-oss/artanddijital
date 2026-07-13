/* ═══════════════════════════════════════════════════════════
   Art&Dijital — main.js
   Hareket kuralı (rapor Bölüm 8): hareket dikkati CTA'ya yönlendirir.
   ═══════════════════════════════════════════════════════════ */

// ⚙️ AYARLAR — yayına almadan önce güncelleyin:
const WHATSAPP_NUMBER = "905551062822"; // ← Kendi WhatsApp numaranız (ülke koduyla, + ve boşluk olmadan)
const CONTACT_EMAIL = "info@artanddijital.com";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Mobil menü ── */
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );
}

/* ── Nav: kaydırınca koyulaşır ── */
const nav = document.getElementById("nav");
if (nav) {
  let lastState = null;
  const onScroll = () => {
    const scrolled = window.scrollY > 24;
    if (scrolled !== lastState) {          // yalnızca durum değişince DOM'a dokun
      nav.classList.toggle("scrolled", scrolled);
      lastState = scrolled;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ── Scroll-reveal (grup içinde sıralı gecikme = stagger) ── */
const revealEls = document.querySelectorAll(".reveal");
// Observer herkes için çalışır; reduced-motion'da CSS yalnızca opaklık fade'i bırakır.
if ("IntersectionObserver" in window) {
  // Aynı anda görünür olan kardeşleri sırayla belirt (Emil: 30-80ms arası)
  const groupTimers = new WeakMap();
  const revealObserver = new IntersectionObserver(
    (entries) => {
      // Görünür hale gelenleri DOM sırasına göre topla
      const shown = entries.filter((e) => e.isIntersecting);
      shown.forEach((entry) => {
        const el = entry.target;
        const parent = el.parentElement;
        // Aynı ebeveyndeki kaçıncı açığa çıkan olduğunu say → gecikme
        const idx = groupTimers.get(parent) || 0;
        el.style.setProperty("--reveal-delay", Math.min(idx * 70, 350) + "ms");
        groupTimers.set(parent, idx + 1);
        // Kısa süre sonra sayacı sıfırla (farklı scroll gruplarını ayır)
        clearTimeout(el._grpReset);
        el._grpReset = setTimeout(() => groupTimers.set(parent, 0), 250);
        el.classList.add("visible");
        revealObserver.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
  // Güvenlik ağı: Observer herhangi bir nedenle tetiklenmezse içerik asla gizli kalmasın
  setTimeout(() => revealEls.forEach((el) => el.classList.add("visible")), 1400);
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

/* ── Canlı demo: telefon görününce chat balonları sırayla girer ── */
const chatEl = document.querySelector(".chat");
if (chatEl && "IntersectionObserver" in window && !prefersReducedMotion) {
  const chatObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          chatEl.classList.add("play");
          chatObserver.unobserve(chatEl);
        }
      });
    },
    { threshold: 0.4 }
  );
  chatObserver.observe(chatEl);
}

/* ── ROI barları: görününce yükseklikleri dolar ── */
const roiCompare = document.querySelector(".roi-compare");
if (roiCompare && "IntersectionObserver" in window && !prefersReducedMotion) {
  const bars = roiCompare.querySelectorAll(".roi-bar");
  const targets = [];
  bars.forEach((b) => { targets.push(getComputedStyle(b).height); b.style.height = "0px"; });
  const roiObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          bars.forEach((b, i) => { b.style.height = targets[i]; });
          roiObserver.unobserve(roiCompare);
        }
      });
    },
    { threshold: 0.5 }
  );
  roiObserver.observe(roiCompare);
}

/* ── Sayaç animasyonu (görünürken pop + sıfırdan sayar) ── */
const counters = document.querySelectorAll(".counter");
if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const numBox = el.closest(".stat-num");     // pop + parıltı bu kutuda
        const target = parseInt(el.dataset.target, 10);
        const duration = 1500;
        const start = performance.now();
        if (numBox) { numBox.classList.add("pop", "counting"); }
        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target);
          if (p < 1) requestAnimationFrame(tick);
          else if (numBox) numBox.classList.remove("counting");
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => counterObserver.observe(el));
} else {
  counters.forEach((el) => (el.textContent = el.dataset.target));
}

/* ── Başlık girişi: kelime kelime belirme (hero H1 + bölüm H2'leri) ── */
if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const wordObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("play");
          wordObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -30px 0px" }
  );

  // Bir başlığın çocuklarını gezerek kelimelere böler.
  // Metin düğümleri → span.word; eleman düğümleri (ör. dönen kelime span'i) tek birim olarak korunur.
  const splitInto = (el, step) => {
    let wi = 0;
    const pieces = [];
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((tok) => {
          if (tok === "") return;
          if (/^\s+$/.test(tok)) {
            pieces.push(document.createTextNode(tok));
          } else {
            const span = document.createElement("span");
            span.className = "word";
            span.textContent = tok;
            span.style.setProperty("--wd", wi * step + "ms");
            pieces.push(span);
            wi++;
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // İç eleman (dönen kelime sarmalayıcısı) — bir kelime birimi gibi animasyonlanır
        node.classList.add("word");
        node.style.setProperty("--wd", wi * step + "ms");
        pieces.push(node);
        wi++;
      }
    });
    el.textContent = "";
    pieces.forEach((p) => el.appendChild(p));
    el.classList.remove("reveal");
    el.classList.add("words-split");
    wordObserver.observe(el);
  };

  // Hero H1 — ilk girişte belirgin kelime kelime giriş (dönen kelime korunur)
  const heroH1 = document.querySelector(".hero h1");
  if (heroH1) splitInto(heroH1, 60);

  // Bölüm H2'leri — yalnızca düz metin olanlar (br/span içerenleri koru)
  document.querySelectorAll("main h2").forEach((h2) => {
    if (h2.children.length > 0) return;
    splitInto(h2, 55);
  });

  // Güvenlik ağı: Observer tetiklenmezse başlıklar gizli kalmasın
  setTimeout(
    () => document.querySelectorAll(".words-split:not(.play)").forEach((el) => el.classList.add("play")),
    1400
  );
}

/* ── Kinetik başlık: dönen kelime (blur'lu çıkış → giriş) ── */
const rotateEl = document.getElementById("rotateWord");
if (rotateEl && !prefersReducedMotion) {
  const words = ["misafir", "rezervasyon", "talep"];
  let i = 0;
  setInterval(() => {
    // 1) Mevcut kelime yukarı + blur ile çıkar
    rotateEl.classList.remove("in");
    rotateEl.classList.add("out");
    // 2) Çıkış bitince yeni kelimeyi aşağıdan blur ile getir
    setTimeout(() => {
      i = (i + 1) % words.length;
      rotateEl.textContent = words[i];
      rotateEl.classList.remove("out");
      void rotateEl.offsetWidth;      // reflow → animasyonu yeniden tetikle
      rotateEl.classList.add("in");
    }, 280);
  }, 3000);
}

/* ── Hero altın parçacıklar (hafif canvas, WebGL yok) ── */
const canvas = document.getElementById("particles");
if (canvas && !prefersReducedMotion) {
  const ctx = canvas.getContext("2d");
  let particles = [];
  let running = true;

  function resize() {
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
  }
  resize();
  window.addEventListener("resize", resize);

  function initParticles() {
    const count = Math.min(70, Math.floor(canvas.offsetWidth / 18));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: (Math.random() * 1.6 + 0.5) * devicePixelRatio,
      vx: (Math.random() - 0.5) * 0.18 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.14 * devicePixelRatio,
      a: Math.random() * 0.5 + 0.15,
      pulse: Math.random() * Math.PI * 2,
    }));
  }
  initParticles();

  function draw(t) {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      const alpha = p.a * (0.6 + 0.4 * Math.sin(t / 1600 + p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(217, 185, 95, ${alpha.toFixed(3)})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  // Hero ekrandan çıkınca animasyonu durdur (performans)
  new IntersectionObserver(
    (entries) => {
      const visible = entries[0].isIntersecting;
      if (visible && !running) {
        running = true;
        requestAnimationFrame(draw);
      } else if (!visible) {
        running = false;
      }
    },
    { threshold: 0 }
  ).observe(canvas);
}

/* ── Komisyon hesaplayıcı ── */
const adr = document.getElementById("adr");
const nights = document.getElementById("nights");
const adrOut = document.getElementById("adrOut");
const nightsOut = document.getElementById("nightsOut");
const calcResult = document.getElementById("calcResult");

function updateCalc() {
  if (!adr || !nights) return;
  const a = parseInt(adr.value, 10);
  const n = parseInt(nights.value, 10);
  const commission = Math.round(a * n * 0.18);
  adrOut.textContent = `€${a}`;
  nightsOut.textContent = `${n} gece`;
  calcResult.textContent = `€${commission.toLocaleString("tr-TR")}`;
}
if (adr && nights) {
  adr.addEventListener("input", updateCalc);
  nights.addEventListener("input", updateCalc);
  updateCalc();
}

/* ── İletişim formu → WhatsApp önceden doldurulmuş mesaj ── */
const ctaForm = document.getElementById("ctaForm");
if (ctaForm) {
  ctaForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("fName").value.trim();
    const biz = document.getElementById("fBiz").value.trim();
    const site = document.getElementById("fSite").value.trim();
    const lines = [
      "Merhaba, ücretsiz AI Görünürlük Kontrolü istiyorum.",
      name && `Ad: ${name}`,
      biz && `İşletme: ${biz}`,
      site && `Site/Instagram: ${site}`,
    ].filter(Boolean);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener");
  });
}

/* Footer WhatsApp linkini ayarla */
const footerWa = document.getElementById("footerWa");
if (footerWa) footerWa.href = `https://wa.me/${WHATSAPP_NUMBER}`;
