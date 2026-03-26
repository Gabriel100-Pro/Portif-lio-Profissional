type Theme = "light" | "dark";

type TypedTextNode = {
	node: Text;
	text: string;
};

const getElementById = <T extends HTMLElement>(id: string): T | null => {
	return document.getElementById(id) as T | null;
};

const setupThemeAndHeroTyping = (): void => {
	const rootElement = document.documentElement;
	const themeToggle = getElementById<HTMLButtonElement>("theme-toggle");
	const themeToggleInner = themeToggle?.querySelector<HTMLSpanElement>(".header-toggle__inner") ?? null;
	const mobileThemeToggle = getElementById<HTMLButtonElement>("theme-toggle-mobile");
	const mobileThemeToggleIcon = getElementById<HTMLSpanElement>("theme-toggle-mobile-icon");
	const mobileThemeToggleText = getElementById<HTMLSpanElement>("theme-toggle-mobile-text");
	const savedTheme = localStorage.getItem("portfolio-theme");

	const updateThemeControls = (isLight: boolean): void => {
		themeToggle?.setAttribute("aria-pressed", String(isLight));
		mobileThemeToggle?.setAttribute("aria-pressed", String(isLight));

		if (themeToggleInner) {
			themeToggleInner.textContent = isLight ? "☀" : "☾";
		}

		if (mobileThemeToggleIcon) {
			mobileThemeToggleIcon.textContent = isLight ? "☾" : "☀";
		}

		if (mobileThemeToggleText) {
			mobileThemeToggleText.textContent = isLight ? "Modo Escuro" : "Modo Claro";
		}
	};

	const setTheme = (theme: Theme): void => {
		if (theme === "light") {
			rootElement.setAttribute("data-theme", "light");
			updateThemeControls(true);
			return;
		}

		rootElement.removeAttribute("data-theme");
		updateThemeControls(false);
	};

	const toggleTheme = (): void => {
		const isLight = rootElement.getAttribute("data-theme") === "light";
		const nextTheme: Theme = isLight ? "dark" : "light";
		setTheme(nextTheme);
		localStorage.setItem("portfolio-theme", nextTheme);
	};

	setTheme(savedTheme === "light" ? "light" : "dark");

	themeToggle?.addEventListener("click", toggleTheme);
	mobileThemeToggle?.addEventListener("click", toggleTheme);

	const hamburger = getElementById<HTMLButtonElement>("hamburger");
	const mobileMenu = getElementById<HTMLElement>("mobile-menu");
	const menuOverlay = getElementById<HTMLDivElement>("menu-overlay");
	const mobileMenuClose = getElementById<HTMLButtonElement>("mobile-menu-close");

	if (hamburger && mobileMenu && menuOverlay) {
		const closeMenu = (): void => {
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

		mobileMenu.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
			link.addEventListener("click", closeMenu);
		});

		mobileMenuClose?.addEventListener("click", closeMenu);
		menuOverlay.addEventListener("click", closeMenu);

		document.addEventListener("keydown", (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				closeMenu();
			}
		});
	}

	const elementsToType = document.querySelectorAll<HTMLElement>(
		".left-filhos h1, .left-filhos h3, .left-filhos > p:not(.text-one)"
	);

	if (!elementsToType.length) {
		return;
	}

	const textNodes: TypedTextNode[] = [];

	elementsToType.forEach((element) => {
		const textNodeWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
			acceptNode(node: Node): number {
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

	const typeNode = (nodeIndex: number): void => {
		if (nodeIndex >= textNodes.length) {
			return;
		}

		const currentItem = textNodes[nodeIndex];
		let charIndex = 0;

		const typeChar = (): void => {
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

const setupToolMarquee = (): void => {
	const marquee = document.querySelector<HTMLElement>(".tool-marquee");
	if (!marquee) {
		return;
	}

	const viewport = marquee.querySelector<HTMLElement>(".tool-marquee__viewport");
	const track = marquee.querySelector<HTMLElement>(".tool-marquee__track");
	const groups = track ? Array.from(track.querySelectorAll<HTMLElement>(".tool-marquee__group")) : [];

	if (!viewport || !track || groups.length < 2) {
		return;
	}

	const sourceGroup = groups[0];
	const mirrorGroup = groups[1];
	const baseMarkup = sourceGroup.innerHTML.trim();
	if (!baseMarkup) {
		return;
	}

	let resizeTimeout: number | undefined;

	const fillMarquee = (): void => {
		sourceGroup.innerHTML = baseMarkup;

		const targetWidth = Math.ceil(viewport.clientWidth);

		while (sourceGroup.scrollWidth < targetWidth) {
			sourceGroup.insertAdjacentHTML("beforeend", baseMarkup);
		}

		mirrorGroup.innerHTML = sourceGroup.innerHTML;
	};

	const scheduleFill = (): void => {
		window.requestAnimationFrame(fillMarquee);
	};

	if (document.readyState === "complete") {
		scheduleFill();
	} else {
		window.addEventListener("load", scheduleFill, { once: true });
	}

	window.addEventListener("resize", () => {
		if (resizeTimeout !== undefined) {
			window.clearTimeout(resizeTimeout);
		}

		resizeTimeout = window.setTimeout(scheduleFill, 120);
	});
};

const setupContactFormRedirect = (): void => {
	const nextField = document.querySelector<HTMLInputElement>("#form-next-url");
	if (!nextField) {
		return;
	}

	const currentUrl = new URL(window.location.href);
	const basePath = currentUrl.pathname.endsWith("/")
		? currentUrl.pathname
		: currentUrl.pathname.replace(/[^/]*$/, "");

	currentUrl.pathname = `${basePath}obrigado.html`;
	currentUrl.search = "";
	currentUrl.hash = "";

	nextField.value = currentUrl.toString();
};

const setupTimelineCursor = (): void => {
	const timeline = document.querySelector<HTMLElement>(".work-timeline");
	const progress = document.querySelector<HTMLElement>(".timeline-progress");
	const cursor = document.querySelector<HTMLElement>(".timeline-cursor");
	const items = Array.from(document.querySelectorAll<HTMLElement>(".timeline-item"));

	if (!timeline || !progress || !cursor || !items.length) {
		return;
	}

	let activeItem = items[0];
	const lineBottomInset = 8;
	const getBaseProgressHeight = (): number => {
		const progressTop = Number.parseFloat(window.getComputedStyle(progress).top) || 0;
		const cursorTop = Number.parseFloat(window.getComputedStyle(cursor).top) || 0;

		return cursorTop - progressTop + cursor.offsetHeight / 2;
	};

	const getFullProgressHeight = (): number => {
		const progressTop = Number.parseFloat(window.getComputedStyle(progress).top) || 0;

		return timeline.offsetHeight - progressTop - lineBottomInset;
	};

	const moveTo = (item: HTMLElement): void => {
		const timelineRect = timeline.getBoundingClientRect();
		const itemRect = item.getBoundingClientRect();
		const itemIndex = items.indexOf(item);
		const targetOffset = itemRect.top - timelineRect.top;
		const progressHeight = itemIndex === items.length - 1
			? getFullProgressHeight()
			: getBaseProgressHeight() + targetOffset;

		cursor.style.transform = `translateY(${targetOffset}px)`;
		progress.style.height = `${progressHeight}px`;
		items.forEach((i) => i.querySelector(".work-card")?.classList.remove("work-card--active"));
		items.forEach((timelineItem, index) => {
			timelineItem.querySelector(".timeline-dot")?.classList.toggle("timeline-dot--completed", index <= itemIndex);
		});
		item.querySelector(".work-card")?.classList.add("work-card--active");
		activeItem = item;
	};

	// position cursor on first item without transition on first render
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

const initializeApp = (): void => {
	const globalWindow = window as Window & { __portfolioAppInitialized?: boolean };

	if (globalWindow.__portfolioAppInitialized) {
		return;
	}

	globalWindow.__portfolioAppInitialized = true;

	setupThemeAndHeroTyping();
	setupToolMarquee();
	setupContactFormRedirect();
	setupTimelineCursor();
};

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
} else {
	initializeApp();
}