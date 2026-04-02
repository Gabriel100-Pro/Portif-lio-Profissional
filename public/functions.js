"use strict";
(() => {
  // src/main.ts
  var getElementById = (id) => {
    return document.getElementById(id);
  };
  var setupNetworkBackground = () => {
    const canvasId = "network-background";
    if (document.getElementById(canvasId)) {
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.id = canvasId;
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let animationFrameId = 0;
    const maxDpr = 2;
    const connectionDistance = 170;
    const movementSpeed = 0.26;
    const getTargetParticleCount = () => {
      const area = width * height;
      return Math.max(28, Math.min(92, Math.floor(area / 24e3)));
    };
    const createParticles = () => {
      const count = getTargetParticleCount();
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * movementSpeed,
        vy: (Math.random() - 0.5) * movementSpeed,
        radius: 1.2 + Math.random() * 1.8
      }));
    };
    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();
    };
    const drawFrame = () => {
      context.clearRect(0, 0, width, height);
      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x <= 0 || particle.x >= width) {
          particle.vx *= -1;
        }
        if (particle.y <= 0 || particle.y >= height) {
          particle.vy *= -1;
        }
      }
      for (let i = 0; i < particles.length; i += 1) {
        const first = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const second = particles[j];
          const dx = first.x - second.x;
          const dy = first.y - second.y;
          const distance = Math.hypot(dx, dy);
          if (distance > connectionDistance) {
            continue;
          }
          const alpha = 1 - distance / connectionDistance;
          context.strokeStyle = `rgba(96, 165, 250, ${0.22 * alpha})`;
          context.lineWidth = 0.85;
          context.beginPath();
          context.moveTo(first.x, first.y);
          context.lineTo(second.x, second.y);
          context.stroke();
        }
      }
      for (const particle of particles) {
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = "rgba(147, 197, 253, 0.95)";
        context.fill();
      }
      animationFrameId = window.requestAnimationFrame(drawFrame);
    };
    resizeCanvas();
    drawFrame();
    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        window.cancelAnimationFrame(animationFrameId);
        return;
      }
      window.cancelAnimationFrame(animationFrameId);
      drawFrame();
    });
  };
  var setupPortfolioLikes = () => {
    const likesSection = document.querySelector("[data-portfolio-likes]");
    const countElement = likesSection?.querySelector("[data-like-count]") ?? null;
    const peopleElement = likesSection?.querySelector("[data-like-people]") ?? null;
    const likeButton = likesSection?.querySelector("[data-like-button]") ?? null;
    const statusElement = likesSection?.querySelector("[data-like-status]") ?? null;
    const iconElement = likesSection?.querySelector(".portfolio-likes__icon") ?? null;
    if (!likesSection || !countElement || !likeButton || !statusElement) {
      return;
    }
    const apiNamespace = "portfolio-gabriel-carlos-alexandre-almeida";
    const apiKey = "total-likes";
    const storageKey = "portfolio-liked-v1";
    const baseUrl = "https://api.counterapi.dev/v1";
    const getUrl = `${baseUrl}/${apiNamespace}/${apiKey}`;
    const upUrl = `${baseUrl}/${apiNamespace}/${apiKey}/up`;
    const downUrl = `${baseUrl}/${apiNamespace}/${apiKey}/down`;
    const numberFormatter = new Intl.NumberFormat("pt-BR");
    let hasLiked = localStorage.getItem(storageKey) === "true";
    let currentCount = 0;
    const setStatus = (message, state = "idle") => {
      statusElement.textContent = message;
      statusElement.dataset.state = state;
    };
    const renderCount = (count) => {
      const normalizedCount = Math.max(0, count);
      countElement.textContent = numberFormatter.format(normalizedCount);
      if (peopleElement) {
        if (normalizedCount === 0) {
          peopleElement.textContent = "Seja a primeira pessoa a deixar o like.";
          return;
        }
        const peopleLabel = normalizedCount === 1 ? "pessoa deixou o like." : "pessoas deixaram o like.";
        peopleElement.textContent = `${numberFormatter.format(normalizedCount)} ${peopleLabel}`;
      }
    };
    const updateButton = (options) => {
      const isLoading = options?.loading ?? false;
      if (isLoading) {
        likeButton.disabled = true;
        likeButton.textContent = "Aguarde...";
        return;
      }
      likeButton.disabled = false;
      likeButton.textContent = hasLiked ? "Tirar meu like" : "Deixar meu like";
      likeButton.classList.toggle("is-liked", hasLiked);
      likeButton.setAttribute("aria-pressed", String(hasLiked));
    };
    const parseCount = (payload) => {
      if (typeof payload.count === "number" && Number.isFinite(payload.count)) {
        return Math.max(0, payload.count);
      }
      if (payload.error) {
        throw new Error(payload.error);
      }
      return 0;
    };
    const loadLikes = async () => {
      setStatus("Carregando likes...", "loading");
      try {
        const response = await fetch(getUrl, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = await response.json();
        currentCount = parseCount(payload);
        renderCount(currentCount);
        setStatus(
          hasLiked ? "Voce ja curtiu este portfolio. Clique para desfazer." : "Gostou do portfolio? Clique para deixar seu like.",
          hasLiked ? "success" : "idle"
        );
      } catch {
        renderCount(currentCount);
        setStatus("Nao foi possivel carregar os likes agora.", "error");
      }
    };
    const toggleLike = async () => {
      updateButton({ loading: true });
      const url = hasLiked ? downUrl : upUrl;
      const isRemoving = hasLiked;
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = await response.json();
        currentCount = parseCount(payload);
        hasLiked = !isRemoving;
        localStorage.setItem(storageKey, String(hasLiked));
        renderCount(currentCount);
        if (hasLiked && iconElement) {
          iconElement.classList.remove("is-bouncing");
          void iconElement.offsetWidth;
          iconElement.classList.add("is-bouncing");
          iconElement.addEventListener("animationend", () => {
            iconElement.classList.remove("is-bouncing");
          }, { once: true });
        }
        setStatus(
          hasLiked ? "Like registrado. Obrigado por apoiar meu trabalho." : "Like removido.",
          hasLiked ? "success" : "idle"
        );
      } catch {
        setStatus(
          isRemoving ? "Nao foi possivel remover seu like agora." : "Nao foi possivel registrar seu like agora.",
          "error"
        );
      } finally {
        updateButton();
      }
    };
    renderCount(0);
    updateButton();
    void loadLikes();
    likeButton.addEventListener("click", () => {
      void toggleLike();
    });
  };
  var setupThemeAndHeroTyping = () => {
    const rootElement = document.documentElement;
    const themeToggle = getElementById("theme-toggle");
    const themeToggleInner = themeToggle?.querySelector(".header-toggle__inner") ?? null;
    const mobileThemeToggle = getElementById("theme-toggle-mobile");
    const mobileThemeToggleIcon = getElementById("theme-toggle-mobile-icon");
    const mobileThemeToggleText = getElementById("theme-toggle-mobile-text");
    const savedTheme = localStorage.getItem("portfolio-theme");
    const updateThemeControls = (isLight) => {
      themeToggle?.setAttribute("aria-pressed", String(isLight));
      mobileThemeToggle?.setAttribute("aria-pressed", String(isLight));
      if (themeToggleInner) {
        themeToggleInner.textContent = isLight ? "\u2600" : "\u263E";
      }
      if (mobileThemeToggleIcon) {
        mobileThemeToggleIcon.textContent = isLight ? "\u263E" : "\u2600";
      }
      if (mobileThemeToggleText) {
        mobileThemeToggleText.textContent = isLight ? "Modo Escuro" : "Modo Claro";
      }
    };
    const setTheme = (theme) => {
      if (theme === "light") {
        rootElement.setAttribute("data-theme", "light");
        updateThemeControls(true);
        return;
      }
      rootElement.removeAttribute("data-theme");
      updateThemeControls(false);
    };
    const toggleTheme = () => {
      const isLight = rootElement.getAttribute("data-theme") === "light";
      const nextTheme = isLight ? "dark" : "light";
      setTheme(nextTheme);
      localStorage.setItem("portfolio-theme", nextTheme);
    };
    setTheme(savedTheme === "light" ? "light" : "dark");
    themeToggle?.addEventListener("click", toggleTheme);
    mobileThemeToggle?.addEventListener("click", toggleTheme);
    const hamburger = getElementById("hamburger");
    const mobileMenu = getElementById("mobile-menu");
    const menuOverlay = getElementById("menu-overlay");
    const mobileMenuClose = getElementById("mobile-menu-close");
    if (hamburger && mobileMenu && menuOverlay) {
      const closeMenu = () => {
        mobileMenu.classList.remove("open");
        menuOverlay.classList.remove("open");
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        mobileMenu.setAttribute("aria-hidden", "true");
      };
      hamburger.addEventListener("click", () => {
        const isOpen = mobileMenu.classList.toggle("open");
        menuOverlay.classList.toggle("open", isOpen);
        hamburger.classList.toggle("active", isOpen);
        hamburger.setAttribute("aria-expanded", String(isOpen));
        mobileMenu.setAttribute("aria-hidden", String(!isOpen));
      });
      mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
      });
      mobileMenuClose?.addEventListener("click", closeMenu);
      menuOverlay.addEventListener("click", closeMenu);
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeMenu();
        }
      });
    }
    const roleTypedText = document.querySelector(".hero-intro__role span");
    if (!roleTypedText) {
      return;
    }
    if (roleTypedText.dataset.typingInitialized === "true") {
      return;
    }
    roleTypedText.dataset.typingInitialized = "true";
    const words = ["FrontEnd", "JavaScript", "HTML", "TypeScript", "CSS", "Front-End"];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      roleTypedText.textContent = words[0];
      return;
    }
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 110;
    const deletingSpeed = 70;
    const holdAfterType = 1150;
    const holdAfterDelete = 220;
    const tick = () => {
      const currentWord = words[wordIndex];
      if (isDeleting) {
        charIndex = Math.max(0, charIndex - 1);
      } else {
        charIndex = Math.min(currentWord.length, charIndex + 1);
      }
      roleTypedText.textContent = currentWord.slice(0, charIndex);
      let nextDelay = isDeleting ? deletingSpeed : typingSpeed;
      if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        nextDelay = holdAfterType;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        nextDelay = holdAfterDelete;
      }
      window.setTimeout(tick, nextDelay);
    };
    roleTypedText.textContent = "";
    window.setTimeout(tick, 360);
  };
  var setupToolMarquee = () => {
    const marquee = document.querySelector(".tool-marquee");
    if (!marquee) {
      return;
    }
    const viewport = marquee.querySelector(".tool-marquee__viewport");
    const track = marquee.querySelector(".tool-marquee__track");
    const groups = track ? Array.from(track.querySelectorAll(".tool-marquee__group")) : [];
    if (!viewport || !track || groups.length < 2) {
      return;
    }
    const sourceGroup = groups[0];
    const mirrorGroup = groups[1];
    const baseMarkup = sourceGroup.innerHTML.trim();
    if (!baseMarkup) {
      return;
    }
    let resizeTimeout;
    const fillMarquee = () => {
      sourceGroup.innerHTML = baseMarkup;
      const targetWidth = Math.ceil(viewport.clientWidth);
      while (sourceGroup.scrollWidth < targetWidth) {
        sourceGroup.insertAdjacentHTML("beforeend", baseMarkup);
      }
      mirrorGroup.innerHTML = sourceGroup.innerHTML;
    };
    const scheduleFill = () => {
      window.requestAnimationFrame(fillMarquee);
    };
    if (document.readyState === "complete") {
      scheduleFill();
    } else {
      window.addEventListener("load", scheduleFill, { once: true });
    }
    window.addEventListener("resize", () => {
      if (resizeTimeout !== void 0) {
        window.clearTimeout(resizeTimeout);
      }
      resizeTimeout = window.setTimeout(scheduleFill, 120);
    });
  };
  var setupContactFormRedirect = () => {
    const nextField = document.querySelector("#form-next-url");
    if (!nextField) {
      return;
    }
    const currentUrl = new URL(window.location.href);
    const basePath = currentUrl.pathname.endsWith("/") ? currentUrl.pathname : currentUrl.pathname.replace(/[^/]*$/, "");
    currentUrl.pathname = `${basePath}obrigado.html`;
    currentUrl.search = "";
    currentUrl.hash = "";
    nextField.value = currentUrl.toString();
  };
  var setupTimelineCursor = () => {
    const timeline = document.querySelector(".work-timeline");
    const progress = document.querySelector(".timeline-progress");
    const cursor = document.querySelector(".timeline-cursor");
    const items = Array.from(document.querySelectorAll(".timeline-item"));
    if (!timeline || !progress || !cursor || !items.length) {
      return;
    }
    let activeItem = items[0];
    const lineBottomInset = 8;
    const getBaseProgressHeight = () => {
      const progressTop = Number.parseFloat(window.getComputedStyle(progress).top) || 0;
      const cursorTop = Number.parseFloat(window.getComputedStyle(cursor).top) || 0;
      return cursorTop - progressTop + cursor.offsetHeight / 2;
    };
    const getFullProgressHeight = () => {
      const progressTop = Number.parseFloat(window.getComputedStyle(progress).top) || 0;
      return timeline.offsetHeight - progressTop - lineBottomInset;
    };
    const getFullCursorOffset = () => {
      const cursorTop = Number.parseFloat(window.getComputedStyle(cursor).top) || 0;
      const lineEnd = timeline.offsetHeight - lineBottomInset;
      return lineEnd - cursorTop - cursor.offsetHeight / 2;
    };
    const moveTo = (item) => {
      const timelineRect = timeline.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const itemIndex = items.indexOf(item);
      const targetOffset = itemIndex === items.length - 1 ? getFullCursorOffset() : itemRect.top - timelineRect.top;
      const progressHeight = itemIndex === items.length - 1 ? getFullProgressHeight() : getBaseProgressHeight() + targetOffset;
      cursor.style.transform = `translateY(${targetOffset}px)`;
      progress.style.height = `${progressHeight}px`;
      items.forEach((i) => i.querySelector(".work-card")?.classList.remove("work-card--active"));
      items.forEach((timelineItem, index) => {
        timelineItem.querySelector(".timeline-dot")?.classList.toggle("timeline-dot--completed", index <= itemIndex);
      });
      item.querySelector(".work-card")?.classList.add("work-card--active");
      activeItem = item;
    };
    cursor.style.transition = "none";
    progress.style.transition = "none";
    moveTo(activeItem);
    window.requestAnimationFrame(() => {
      cursor.style.transition = "";
      progress.style.transition = "";
    });
    items.forEach((item) => {
      item.addEventListener("click", () => {
        moveTo(item);
      });
    });
    window.addEventListener("resize", () => {
      moveTo(activeItem);
    });
  };
  var setupHeaderNavActive = () => {
    const links = Array.from(document.querySelectorAll(".header-link"));
    const internalLinks = links.filter((link) => !link.hostname || link.hostname === window.location.hostname);
    internalLinks.forEach((link) => {
      link.addEventListener("click", () => {
        internalLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
      });
    });
  };
  var setupSectionScrollReveal = () => {
    const sections = Array.from(document.querySelectorAll("section"));
    if (!sections.length) {
      return;
    }
    sections.forEach((section) => {
      section.classList.add("scroll-reveal");
    });
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target;
          section.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px"
      }
    );
    sections.forEach((section) => {
      observer.observe(section);
    });
  };
  var initializeApp = () => {
    const globalWindow = window;
    if (globalWindow.__portfolioAppInitialized) {
      return;
    }
    globalWindow.__portfolioAppInitialized = true;
    setupNetworkBackground();
    setupSectionScrollReveal();
    setupThemeAndHeroTyping();
    setupPortfolioLikes();
    setupToolMarquee();
    setupContactFormRedirect();
    setupTimelineCursor();
    setupHeaderNavActive();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
  } else {
    initializeApp();
  }
})();
