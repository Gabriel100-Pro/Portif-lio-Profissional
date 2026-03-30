"use strict";
(() => {
  // src/main.ts
  var getElementById = (id) => {
    return document.getElementById(id);
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
    const elementsToType = document.querySelectorAll(
      ".left-filhos h1, .left-filhos h3, .left-filhos > p:not(.text-one)"
    );
    if (!elementsToType.length) {
      return;
    }
    const textNodes = [];
    elementsToType.forEach((element) => {
      const textNodeWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!(node instanceof Text) || !node.nodeValue || !node.nodeValue.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      let currentNode = textNodeWalker.nextNode();
      while (currentNode) {
        if (!(currentNode instanceof Text)) {
          currentNode = textNodeWalker.nextNode();
          continue;
        }
        const normalizedText = currentNode.data.replace(/\s+/g, " ").trim();
        if (normalizedText) {
          textNodes.push({
            node: currentNode,
            text: normalizedText
          });
          currentNode.data = "";
        }
        currentNode = textNodeWalker.nextNode();
      }
    });
    if (!textNodes.length) {
      return;
    }
    const typingSpeed = 26;
    const betweenNodesDelay = 70;
    const typeNode = (nodeIndex) => {
      if (nodeIndex >= textNodes.length) {
        return;
      }
      const currentItem = textNodes[nodeIndex];
      let charIndex = 0;
      const typeChar = () => {
        currentItem.node.nodeValue = currentItem.text.slice(0, charIndex);
        if (charIndex < currentItem.text.length) {
          charIndex += 1;
          window.setTimeout(typeChar, typingSpeed);
          return;
        }
        window.setTimeout(() => typeNode(nodeIndex + 1), betweenNodesDelay);
      };
      typeChar();
    };
    typeNode(0);
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
    sections.forEach((section, index) => {
      section.classList.add("scroll-reveal");
      if (index === 0) {
        section.classList.add("is-visible");
      }
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
