// selectors.js
// CSS Selector Generation
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

// JavaScript Path Generation
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

// XPath Generation
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

window.pathFinderSelectors = {
  getCSSSelector,
  getJSPath,
  getXPath,
};
