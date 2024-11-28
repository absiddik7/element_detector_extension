// content.js
let isActive = false;
let highlightedElement = null;
let breadcrumbTrail = null;
let overlay = null;

// Selector Functions
function getCSSSelector(element) {
  if (!(element instanceof Element)) return;
  const path = [];
  while (element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase();
    if (element.id) {
      selector += "#" + element.id;
      path.unshift(selector);
      break;
    } else {
      let sibling = element;
      let nth = 1;
      while (sibling.previousElementSibling) {
        sibling = sibling.previousElementSibling;
        if (sibling.nodeName.toLowerCase() === selector) nth++;
      }
      if (nth !== 1) selector += `:nth-of-type(${nth})`;
    }
    path.unshift(selector);
    element = element.parentNode;
  }
  return path.join(" > ");
}

function getJSPath(element) {
  if (!(element instanceof Element)) return;
  const path = [];
  while (element.parentNode) {
    let selector = element.nodeName.toLowerCase();
    if (element.id) {
      return `document.getElementById('${element.id}')`;
    }
    const siblings = Array.from(element.parentNode.children);
    const index = siblings.indexOf(element);
    if (index > 0) {
      selector += `[${index}]`;
    }
    path.unshift(selector);
    element = element.parentNode;
  }
  return `document.querySelector('${getCSSSelector(element)}')`;
}

function getXPath(element) {
  if (!(element instanceof Element)) return;
  const idx = (sib, name) =>
    sib
      ? idx(sib.previousElementSibling, name || sib.tagName) +
        (sib.tagName == name)
      : 1;
  const segs = (elm) =>
    !elm || elm.nodeType !== 1
      ? [""]
      : elm.id && document.getElementById(elm.id) === elm
      ? [`//*[@id="${elm.id}"]`]
      : [...segs(elm.parentNode), `${elm.tagName}[${idx(elm)}]`];
  return segs(element).join("/").toLowerCase();
}

// UI Components
function createBreadcrumbTrail() {
  const trail = document.createElement("div");
  trail.id = "pathfinder-breadcrumb";
  trail.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
        display: none;
        max-width: 80%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        pointer-events: none;
    `;
  document.body.appendChild(trail);
  return trail;
}

function createResultsPopup() {
  const popup = document.createElement("div");
  popup.id = "pathfinder-popup";
  popup.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #ccc;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 10000;
        display: none;
        max-width: 500px;
        font-family: monospace;
        font-size: 12px;
    `;
  document.body.appendChild(popup);
  return popup;
}

// Element Functions
function getElementPreview(element) {
  if (!element) return "";
  let preview = element.tagName.toLowerCase();
  if (element.id) preview += `#${element.id}`;
  if (element.className) {
    const classes = Array.from(element.classList).join(".");
    if (classes) preview += `.${classes}`;
  }
  return preview;
}

function updateBreadcrumbTrail(element) {
  if (!element || !breadcrumbTrail) return;

  const path = [];
  let current = element;

  while (current && current.tagName && current !== document.body) {
    path.unshift(getElementPreview(current));
    current = current.parentElement;
  }

  breadcrumbTrail.textContent = path.join(" → ");
  breadcrumbTrail.style.display = "block";

  const rect = element.getBoundingClientRect();
  breadcrumbTrail.style.top = `${rect.top + window.scrollY - 30}px`;
}

// Clipboard Functions
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const feedback = document.createElement("div");
    feedback.textContent = "Copied!";
    feedback.style.cssText = `
            position: fixed;
            background: #4CAF50;
            color: white;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
            z-index: 10001;
            pointer-events: none;
        `;
    document.body.appendChild(feedback);

    const rect = event.target.getBoundingClientRect();
    feedback.style.left = `${rect.left}px`;
    feedback.style.top = `${rect.top - 30}px`;

    setTimeout(() => feedback.remove(), 1000);
  });
}

function createCopyButton(text, label) {
  const button = document.createElement("button");
  button.textContent = `Copy ${label}`;
  button.style.cssText = `
        background: #f0f0f0;
        border: 1px solid #ccc;
        padding: 4px 8px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 11px;
    `;
  button.onclick = (e) => {
    e.stopPropagation();
    copyToClipboard(text);
  };
  return button;
}

// Popup Management
function showResultsPopup(element, x, y) {
  const popup = document.getElementById("pathfinder-popup");
  const cssSelector = getCSSSelector(element);
  const jsPath = getJSPath(element);
  const xpath = getXPath(element);

  popup.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong>CSS Selector:</strong><br>
            <code>${cssSelector}</code>
        </div>
        <div style="margin-bottom: 10px;">
            <strong>JavaScript Path:</strong><br>
            <code>${jsPath}</code>
        </div>
        <div style="margin-bottom: 10px;">
            <strong>XPath:</strong><br>
            <code>${xpath}</code>
        </div>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
            ${createCopyButton(cssSelector, "CSS").outerHTML}
            ${createCopyButton(jsPath, "JS").outerHTML}
            ${createCopyButton(xpath, "XPath").outerHTML}
        </div>
    `;

  const rect = element.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();

  let left = x + 10;
  let top = y + 10;

  if (left + popupRect.width > window.innerWidth) {
    left = window.innerWidth - popupRect.width - 10;
  }

  if (top + popupRect.height > window.innerHeight) {
    top = window.innerHeight - popupRect.height - 10;
  }

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
  popup.style.display = "block";
}

// Event Handlers
function handleMouseMove(e) {
  if (!isActive) return;

  const element = document.elementFromPoint(e.clientX, e.clientY);
  if (element === highlightedElement) return;

  if (highlightedElement) {
    highlightedElement.style.outline = "";
  }

  highlightedElement = element;
  if (highlightedElement && highlightedElement !== document.body) {
    highlightedElement.style.outline = "2px solid #007bff";
    updateBreadcrumbTrail(highlightedElement);
  }
}

function handleClick(e) {
  if (!isActive) return;
  e.preventDefault();
  e.stopPropagation();

  if (highlightedElement && highlightedElement !== document.body) {
    showResultsPopup(highlightedElement, e.clientX, e.clientY);
  }
}

function handleClickOutside(e) {
  const popup = document.getElementById("pathfinder-popup");
  if (popup && !popup.contains(e.target)) {
    popup.style.display = "none";
  }
}

// Initialize extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle") {
    isActive = !isActive;

    if (isActive) {
      if (!breadcrumbTrail) {
        breadcrumbTrail = createBreadcrumbTrail();
      }
      if (!overlay) {
        overlay = createResultsPopup();
      }
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("click", handleClick, true);
      document.addEventListener("click", handleClickOutside);
      document.body.style.cursor = "crosshair";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("click", handleClickOutside);
      document.body.style.cursor = "";
      if (highlightedElement) {
        highlightedElement.style.outline = "";
      }
      if (breadcrumbTrail) {
        breadcrumbTrail.style.display = "none";
      }
      if (overlay) {
        overlay.style.display = "none";
      }
    }

    sendResponse({ status: "success" });
  }
  return true;
});
