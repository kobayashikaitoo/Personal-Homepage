document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupRevealAnimations();
  setupNavbarScroll();
  setupBlogFilters();
  setupArticlePage();
  setupGalleryFilters();
  setupGalleryPopup();
  setupContactForm();
});

/* ── Navigation ── */
function setupNavigation() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav-links");
  if (!toggle || !nav) return;

  const currentPage = location.pathname.split("/").pop();

  const syncNavigationState = (isOpen) => {
    nav.classList.toggle("open", isOpen);
    toggle.classList.toggle("is-active", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  };

  syncNavigationState(false);

  toggle.addEventListener("click", () => {
    syncNavigationState(!nav.classList.contains("open"));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) {
      syncNavigationState(false);
    }
  });

  // Mark active page
  nav.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href");
    const isMatch = href && currentPage === href;
    const isArticlePageBlogLink = currentPage === "article.html" && href === "blog.html";
    if (isMatch || isArticlePageBlogLink) {
      link.classList.add("active");
    }
    link.addEventListener("click", () => syncNavigationState(false));
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

/* ── Article page (JSON-powered) ── */
async function setupArticlePage() {
  const articleRoot = document.getElementById("article-page");
  if (!articleRoot) return;

  const articleId = new URLSearchParams(window.location.search).get("id");
  if (!articleId) {
    renderArticleError("Article ID is missing. Please choose an article from the blog page.");
    return;
  }

  try {
    const response = await fetch("data/articles.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load article data.");
    }

    const articles = await response.json();
    const article = articles.find((item) => item.id === articleId);

    if (!article) {
      renderArticleError("The requested article was not found.");
      return;
    }

    const titleEl = document.getElementById("article-title");
    const summaryEl = document.getElementById("article-summary");
    const heroEl = document.getElementById("article-hero-image");
    const tagEl = document.getElementById("article-tag");
    const dateEl = document.getElementById("article-date");
    const readTimeEl = document.getElementById("article-read-time");
    const contentEl = document.getElementById("article-content");

    if (!titleEl || !summaryEl || !heroEl || !tagEl || !dateEl || !readTimeEl || !contentEl) {
      return;
    }

    document.title = `${article.title} - Friederik Ferdinand`;
    titleEl.textContent = article.title;
    summaryEl.textContent = article.summary;
    heroEl.style.backgroundImage = `url('${article.image}')`;
    tagEl.textContent = article.category;
    dateEl.textContent = article.date;
    readTimeEl.textContent = article.readTime;

    contentEl.innerHTML = "";
    (article.content || []).forEach((block) => {
      const type = block?.type === "h2" ? "h2" : "p";
      const el = document.createElement(type);
      el.textContent = block?.text || "";
      contentEl.appendChild(el);
    });
  } catch (error) {
    renderArticleError("Unable to load article content right now. Please try again.");
  }
}

function renderArticleError(message) {
  const titleEl = document.getElementById("article-title");
  const summaryEl = document.getElementById("article-summary");
  const contentEl = document.getElementById("article-content");

  if (titleEl) {
    titleEl.textContent = "Article Not Available";
  }

  if (summaryEl) {
    summaryEl.textContent = message;
  }

  if (contentEl) {
    contentEl.innerHTML = "";
    const backLink = document.createElement("a");
    backLink.href = "blog.html";
    backLink.className = "btn btn-primary";
    backLink.textContent = "Back to Blog";
    contentEl.appendChild(backLink);
  }
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

/* ── Gallery popup ── */
function setupGalleryPopup() {
  const galleryGrid = document.getElementById("gallery-grid");
  const items = Array.from(document.querySelectorAll("#gallery-grid .gallery-item"));
  if (!galleryGrid || !items.length) return;

  const modal = document.createElement("div");
  modal.className = "gallery-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="gallery-modal__backdrop" data-close="true"></div>
    <div class="gallery-modal__panel" role="dialog" aria-modal="true" aria-label="Gallery detail popup">
      <button class="gallery-modal__close" type="button" aria-label="Close popup">×</button>
      <img class="gallery-modal__image" src="" alt="" />
      <div class="gallery-modal__meta">
        <p class="gallery-modal__category"></p>
        <h3 class="gallery-modal__title"></h3>
        <p class="gallery-modal__description"></p>
      </div>
    </div>
  `;

  const modalImage = modal.querySelector(".gallery-modal__image");
  const modalCategory = modal.querySelector(".gallery-modal__category");
  const modalTitle = modal.querySelector(".gallery-modal__title");
  const modalDescription = modal.querySelector(".gallery-modal__description");
  const closeButton = modal.querySelector(".gallery-modal__close");

  let previousActiveElement = null;
  let closeTimeout = null;

  const closeModal = () => {
    if (!modal.classList.contains("open")) return;
    modal.classList.remove("open");

    if (closeTimeout) {
      clearTimeout(closeTimeout);
    }

    closeTimeout = window.setTimeout(() => {
      modal.classList.remove("is-visible");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    }, 360);
  };

  const openModal = (item) => {
    const image = item.querySelector("img");
    const caption = item.querySelector(".gallery-caption")?.textContent?.trim() || image?.alt || "Untitled";
    const category = item.dataset.category || "Gallery";
    const description = item.dataset.description || `Visual details for ${caption}.`;
    if (!image || !modalImage || !modalCategory || !modalTitle || !modalDescription) return;

    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }

    previousActiveElement = document.activeElement;
    modalImage.src = image.src;
    modalImage.alt = image.alt || caption;
    modalCategory.textContent = category;
    modalTitle.textContent = caption;
    modalDescription.textContent = description;

    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    window.requestAnimationFrame(() => {
      modal.classList.add("open");
    });
    closeButton?.focus();
  };

  galleryGrid.addEventListener("click", (e) => {
    const item = e.target.closest(".gallery-item");
    if (!item) return;
    openModal(item);
  });

  items.forEach((item) => {
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", `Open detail for ${item.querySelector(".gallery-caption")?.textContent?.trim() || "image"}`);

    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(item);
      }
    });
  });

  modal.addEventListener("click", (e) => {
    if (e.target.dataset.close === "true" || e.target.classList.contains("gallery-modal")) {
      closeModal();
    }
  });

  closeButton?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });

  document.body.appendChild(modal);
}

/* ── Contact form ── */
function setupContactForm() {
  const form = document.getElementById("contact-form");
  const alert = document.getElementById("contact-alert");
  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const endpoint = form.dataset.formspreeEndpoint;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const topic = form.topic.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      showAlert(alert, "Please complete all required fields.", true);
      return;
    }

    if (!/.+@.+\..+/.test(email)) {
      showAlert(alert, "Please enter a valid email address.", true);
      return;
    }

    if (!endpoint || endpoint.includes("your_form_id")) {
      showAlert(alert, "Formspree endpoint is not configured yet. Replace your_form_id in contact.html first.", true);
      return;
    }

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          topic: topic || "General Inquiry",
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      form.reset();
      showAlert(alert, "Thank you! Your message has been sent.");
    } catch (error) {
      showAlert(alert, "Sorry, your message could not be sent. Please try again.", true);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Send Message";
      }
    }
  });
}

function showAlert(el, text, isError = false) {
  if (!el) return;
  el.textContent = text;
  el.style.display = "block";
  el.style.background = isError ? "#ffeaea" : "rgba(217, 225, 197, 0.4)";
  el.style.color = isError ? "#b00020" : "#141414";
}
