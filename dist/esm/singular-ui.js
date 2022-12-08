import { singular } from "./singular";
const ORIGIN_LENGTH = location.origin.length;
let ACTIVATED_LINKS = [];
function activateSelector(selector) {
  const containers = Array.from(document.querySelectorAll(selector));
  let current = containers.length;
  while (current-- > 0) {
    activateContainer(containers[current]);
  }
}
function inactivateAnchors() {
  const anchors = ACTIVATED_LINKS;
  let current = anchors.length;
  while (current-- > 0) {
    anchors[current].classList.remove("_active");
  }
  ACTIVATED_LINKS = [];
}
function activateContainer(container) {
  const currentPath = location.href.substring(ORIGIN_LENGTH);
  const anchors = container.getElementsByTagName("A");
  let current = anchors.length;
  while (current-- > 0) {
    let anchor = anchors[current];
    if (currentPath !== anchor.href.substring(ORIGIN_LENGTH)) {
      continue;
    }
    activateAnchor(anchor);
    anchor.focus();
    anchor.blur();
    do {
      let ul = anchor.closest("ul");
      if (ul) {
        const li = ul.closest("li");
        if (li) {
          anchor = li.getElementsByTagName("A")[0];
          if (anchor) {
            activateAnchor(anchor);
            continue;
          }
        }
      }
      break;
    } while (anchor);
  }
}
function activateAnchor(anchor) {
  ACTIVATED_LINKS[ACTIVATED_LINKS.length] = anchor;
  anchor.classList.add("_active");
}
export function activeLink(selector) {
  return singular.load(() => {
    activateSelector(selector);
  }).unload(inactivateAnchors);
}
export function activeClass(prefix = "") {
  const offset = prefix.length;
  return singular.load(() => {
    console.log(location.pathname.slice(offset).split("/"));
  });
}
