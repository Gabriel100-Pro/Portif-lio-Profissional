document.addEventListener("DOMContentLoaded", () => {
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
