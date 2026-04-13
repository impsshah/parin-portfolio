const publications = [
  {
    year: "2026",
    title: "Aerodynamic Modeling of a Dual Sail Spherical Sailing Omnidirectional Rover (SSailOR)",
    authors: "Parin Shah, George Carrion, Aditya Varanwal, Andre P. Mazzoleni",
    href: "./assets/publication-aerodynamic-modeling.pdf",
    meta: "ASME 2026 Fluid Engineering Division Summer Meeting, FEDSM2026-184416"
  },
  {
    year: "2026",
    title: "Aerodynamic Coefficient Identification for a Spherical Sailing Omnidirectional Rover (SSailOR) via Wind Tunnel Testing",
    authors: "Aditya Varanwal, George Carrion, Parin Shah, Ashley Ortenburg, Diego Ramirez-Gomez, Chris Vermillion, Andre P. Mazzoleni",
    href: "./assets/publication-aero-coefficients.pdf",
    meta: "ASME 2026 Fluid Engineering Division Summer Meeting, FEDSM2026-184261"
  },
  {
    year: "2026",
    title: "CFD Analysis and Experimental Validation of the Aerodynamic Forces Acting on the Spherical Sailing Omnidirectional Rover (SSailOR)",
    authors: "George Carrion, Parin Shah, Aditya Varanwal, Chris Vermillion, Andre P. Mazzoleni",
    href: "./assets/publication-cfd-validation.pdf",
    meta: "ASME 2026 Fluid Engineering Division Summer Meeting, FEDSM2026-184435"
  }
];

const publicationGrid = document.querySelector("#publication-grid");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (publicationGrid) {
  publications.forEach((publication) => {
    const card = document.createElement("article");
    card.className = "publication-card";
    card.innerHTML = `
      <div>
        <span class="publication-year">${publication.year}</span>
        <h3>${publication.title}</h3>
        <p class="publication-authors">${publication.meta}</p>
      </div>
      <p class="publication-authors">${publication.authors}</p>
      <a class="text-link" href="${publication.href}" target="_blank" rel="noreferrer">Open PDF</a>
    `;
    publicationGrid.appendChild(card);
  });
}

const revealSelectors = [
  ".hero-copy",
  ".hero-panel",
  ".intro-card",
  ".feature-card",
  ".case-study-browser",
  ".thesis-summary",
  ".thesis-points article",
  ".detail-card",
  ".submission-card",
  ".publication-card",
  ".timeline-item",
  ".project-card",
  ".education-card",
  ".contact-card",
  ".section-heading"
];

const revealElements = document.querySelectorAll(revealSelectors.join(", "));

revealElements.forEach((element, index) => {
  element.setAttribute("data-reveal", "");
  element.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
});

if (!reduceMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const caseTabs = document.querySelectorAll(".case-tab");
const casePanels = document.querySelectorAll(".case-study-panel");

caseTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const panelId = tab.dataset.panel;

    caseTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    casePanels.forEach((panel) => {
      const isActive = panel.dataset.panel === panelId;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });
  });
});

const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".site-nav a");

const setActiveNav = () => {
  const scrollY = window.scrollY + 140;
  let currentId = "";

  sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;

    if (scrollY >= top && scrollY < bottom) {
      currentId = section.id;
    }
  });

  navLinks.forEach((link) => {
    const isCurrent = link.getAttribute("href") === `#${currentId}`;
    link.classList.toggle("is-current", isCurrent);
  });
};

const setHeaderProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  document.documentElement.style.setProperty("--header-progress", `${Math.min(progress, 100)}%`);
};

const parallaxItems = document.querySelectorAll(".hero-photo-card, .visual-card, .project-card-image");

const updateParallax = () => {
  if (reduceMotion) {
    return;
  }

  const viewportCenter = window.innerHeight / 2;

  parallaxItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.top + rect.height / 2;
    const delta = (itemCenter - viewportCenter) / window.innerHeight;
    const offset = Math.max(Math.min(delta * -8, 8), -8);
    item.setAttribute("data-parallax", "");
    item.style.transform = `translateY(${offset}px)`;
  });
};

const updateOnScroll = () => {
  setActiveNav();
  setHeaderProgress();
  updateParallax();
};

updateOnScroll();
window.addEventListener("scroll", updateOnScroll, { passive: true });
window.addEventListener("resize", updateOnScroll);
