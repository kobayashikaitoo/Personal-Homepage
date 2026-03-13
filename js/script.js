document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupRevealAnimations();
  setupNavbarScroll();
  setupBlogFilters();
  setupGalleryFilters();
  setupContactForm();
});

/* ── Navigation ── */
function setupNavigation() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav-links");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  // Mark active page
  nav.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && location.pathname.endsWith(href)) {
      link.classList.add("active");
    }
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}

/* ── Sticky navbar shadow ── */
function setupNavbarScroll() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ── Scroll reveal ── */
function setupRevealAnimations() {
  const items = document.querySelectorAll("[data-animate]");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((item) => observer.observe(item));
}

/* ── Blog filters ── */
function setupBlogFilters() {
  const searchInput = document.getElementById("blog-search");
  const filterRow = document.getElementById("blog-filters");
  const cards = Array.from(document.querySelectorAll("#blog-list article"));
  if (!cards.length) return;

  let activeCategory = "all";

  const applyFilters = () => {
    const term = (searchInput?.value || "").trim().toLowerCase();
    cards.forEach((card) => {
      const category = card.dataset.category || "";
      const title = (card.dataset.title || "").toLowerCase();
      const matchCat = activeCategory === "all" || category === activeCategory;
      const matchSearch = !term || title.includes(term);
      card.classList.toggle("hidden", !(matchCat && matchSearch));
    });
  };

  searchInput?.addEventListener("input", applyFilters);

  filterRow?.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      filterRow.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      activeCategory = chip.dataset.filter || "all";
      applyFilters();
    });
  });
}

/* ── Gallery filters ── */
function setupGalleryFilters() {
  const filterRow = document.getElementById("gallery-filters");
  const items = Array.from(document.querySelectorAll("#gallery-grid .gallery-item"));
  if (!items.length) return;

  let activeCategory = "all";

  const applyFilters = () => {
    items.forEach((item) => {
      const category = item.dataset.category || "";
      const matches = activeCategory === "all" || category === activeCategory;
      item.classList.toggle("hidden", !matches);
    });
  };

  filterRow?.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      filterRow.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      activeCategory = chip.dataset.filter || "all";
      applyFilters();
    });
  });
}

/* ── Contact form ── */
function setupContactForm() {
  const form = document.getElementById("contact-form");
  const alert = document.getElementById("contact-alert");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      showAlert(alert, "Please complete all required fields.", true);
      return;
    }

    if (!/.+@.+\..+/.test(email)) {
      showAlert(alert, "Please enter a valid email address.", true);
      return;
    }

    form.reset();
    showAlert(alert, "Thank you! Your message has been sent.");
  });
}

function showAlert(el, text, isError = false) {
  if (!el) return;
  el.textContent = text;
  el.style.display = "block";
  el.style.background = isError ? "#ffeaea" : "rgba(217, 225, 197, 0.4)";
  el.style.color = isError ? "#b00020" : "#141414";
}
