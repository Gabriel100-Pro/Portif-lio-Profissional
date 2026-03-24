document.addEventListener("DOMContentLoaded", () => {
	/* ── Hamburger menu ── */
	const hamburger = document.getElementById("hamburger");
	const mobileMenu = document.getElementById("mobile-menu");
	const menuOverlay = document.getElementById("menu-overlay");

	const closeMenu = () => {
		mobileMenu.classList.remove("open");
		menuOverlay.classList.remove("open");
		hamburger.classList.remove("active");
		hamburger.setAttribute("aria-expanded", "false");
		mobileMenu.setAttribute("aria-hidden", "true");
	};

	if (hamburger && mobileMenu) {
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

		menuOverlay.addEventListener("click", closeMenu);
	}
	const elementsToType = document.querySelectorAll(
		".left-filhos h1, .left-filhos h3, .left-filhos > p:not(.text-one)"
	);

	if (!elementsToType.length) {
		return;
	}

	const textNodes = [];

	elementsToType.forEach((element) => {
		const textNodeWalker = document.createTreeWalker(
			element,
			NodeFilter.SHOW_TEXT,
			{
				acceptNode(node) {
					if (!node.nodeValue || !node.nodeValue.trim()) {
						return NodeFilter.FILTER_REJECT;
					}

					return NodeFilter.FILTER_ACCEPT;
				}
			}
		);

		let currentNode = textNodeWalker.nextNode();

		while (currentNode) {
			const normalizedText = currentNode.nodeValue.replace(/\s+/g, " ").trim();

			if (normalizedText) {
				textNodes.push({
					node: currentNode,
					text: normalizedText
				});
				currentNode.nodeValue = "";
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
				setTimeout(typeChar, typingSpeed);
				return;
			}

			setTimeout(() => typeNode(nodeIndex + 1), betweenNodesDelay);
		};

		typeChar();
	};

	typeNode(0);
});


function setupToolMarquee() {
  const marquee = document.querySelector(".tool-marquee");
  if (!marquee) return;

  const viewport = marquee.querySelector(".tool-marquee__viewport");
  const track = marquee.querySelector(".tool-marquee__track");
  const groups = track ? Array.from(track.querySelectorAll(".tool-marquee__group")) : [];

  if (!viewport || !track || groups.length < 2) return;

  const sourceGroup = groups[0];
  const mirrorGroup = groups[1];
  const baseMarkup = sourceGroup.innerHTML.trim();
  if (!baseMarkup) return;

  let resizeTimeout;

  const fillMarquee = () => {
    sourceGroup.innerHTML = baseMarkup;

    const targetWidth = Math.ceil(viewport.clientWidth * 1.0);

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
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(scheduleFill, 120);
  });
}

setupToolMarquee();

function setupContactFormRedirect() {
  const nextField = document.querySelector("#form-next-url");
  if (!nextField) return;

  const currentUrl = new URL(window.location.href);
  const basePath = currentUrl.pathname.endsWith("/")
    ? currentUrl.pathname
    : currentUrl.pathname.replace(/[^/]*$/, "");

  currentUrl.pathname = `${basePath}obrigado.html`;
  currentUrl.search = "";
  currentUrl.hash = "";

  nextField.value = currentUrl.toString();
}

setupContactFormRedirect();