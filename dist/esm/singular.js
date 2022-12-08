const { documentElement } = document;
documentElement.style.visibility = "hidden";
const { href: START_URL, origin: ORIGIN } = location;
const { isArray: IS_ARRAY, from: FROM } = Array;
const { keys: KEYS } = Object;
const ESM = !document.currentScript;
const _ROOT_INDEX = /^\/index\.\w{2,4}$/;
const _INDEX = /\/index\.\w{2,4}$/;
let CONFIGURE = {
  development: false,
  outletSelectors: null,
  classSelectors: null,
  enableKeepHtml: false,
  enableKeepStyles: false,
  enableSearchString: false,
  enableHashString: false,
  disableTitleReset: false,
  disableTitleChange: false
};
let RENDERED_STYLES = {};
let RENDERED_SCRIPTS = {};
let LOADED = false;
let CURRENT_URL = getCurrentUrl(START_URL);
let CURRENT_SCRIPT_URL = getLifecycleUrl(START_URL);
let ABORT_CONTROLLER;
function debug(...args) {
  return (debug = CONFIGURE.development ? function(...args2) {
    console.debug.apply(null, ["[singular]", ...args2]);
  } : function() {
  }).apply(this, arguments);
}
class Page {
  constructor(url, title, styles = [], scripts = [], classes = void 0, html = "") {
    this.url = url;
    this.title = title;
    this.styles = styles;
    this.scripts = scripts;
    this.classes = classes;
    this.html = html;
  }
}
class Lifecycle {
  static seriesCallbacks = [];
  static parallelCallbacks = [];
  static readyCallbacks = [];
  static loadCallbacks = [];
  static unloadCallbacks = [];
  enterCallbacks = [];
  exitCallbacks = [];
  static get current() {
    return LIFECYCLES[CURRENT_SCRIPT_URL] || (LIFECYCLES[CURRENT_SCRIPT_URL] = new Lifecycle());
  }
}
class State {
  singular;
  constructor(href) {
    this.singular = {
      href
    };
  }
}
class ChangedElements extends Array {
  constructor(changedElements) {
    super(0);
    this.push.apply(this, IS_ARRAY(changedElements) ? changedElements : [changedElements]);
  }
  #getElements(methodName, selectors) {
    const list = [];
    const end = this.length;
    let current = -1;
    while (++current < end) {
      const nodes = this[current].querySelectorAll(selectors);
      const nodeEnd = nodes.length;
      let nodeCurrent = -1;
      while (++nodeCurrent < nodeEnd) {
        const node = nodes[nodeCurrent];
        if (list.indexOf(node) === -1) {
          list[list.length] = node;
        }
      }
    }
    return list;
  }
  getElementById(elementId) {
    return document.getElementById(elementId);
  }
  getElementsByTagName(qualifiedName) {
    return this.#getElements("getElementsByTagName", qualifiedName);
  }
  getElementsByClassName(classNames) {
    return this.#getElements("getElementsByClassName", classNames);
  }
  querySelector(selectors) {
    const end = this.length;
    let current = -1;
    while (++current < end) {
      const node = this[current].querySelector(selectors);
      if (node) {
        return node;
      }
    }
    return null;
  }
  querySelectorAll(selectors) {
    return this.#getElements("querySelectorAll", selectors);
  }
}
const PAGES = {
  [CURRENT_URL]: new Page(START_URL, document.title)
};
const LIFECYCLES = {
  [CURRENT_SCRIPT_URL]: new Lifecycle()
};
const CHAIN = {
  configure,
  series,
  parallel,
  ready,
  load,
  enter,
  exit,
  unload,
  changed
};
export function configure(values) {
  let { classSelectors } = values;
  if (classSelectors) {
    if (!IS_ARRAY(classSelectors)) {
      classSelectors = [classSelectors];
    }
    let current = classSelectors.length;
    const dividedClassSelectors = [];
    while (current-- > 0) {
      dividedClassSelectors.push(...classSelectors[current].split(","));
    }
    values.classSelectors = dividedClassSelectors;
  }
  CONFIGURE = Object.assign(CONFIGURE, values);
  return CHAIN;
}
export function addStyle(href) {
  const link = tag("link");
  return {
    link,
    promise: new Promise((resolve) => {
      const resolver = () => resolve();
      link.onload = resolver;
      link.onerror = resolver;
      link.rel = "stylesheet";
      document.head.append(link);
      link.href = href;
    })
  };
}
export function addScript(src, async = true) {
  const script = tag("script");
  return {
    script,
    promise: new Promise((resolve) => {
      const resolver = () => resolve();
      if (ESM) {
        script.type = "module";
      }
      script.onload = resolver;
      script.onerror = resolver;
      script.async = async;
      document.head.append(script);
      script.src = src;
    })
  };
}
export function parallel(callback) {
  Lifecycle.parallelCallbacks[Lifecycle.parallelCallbacks.length] = callback;
  return CHAIN;
}
export function series(callback) {
  Lifecycle.seriesCallbacks[Lifecycle.seriesCallbacks.length] = callback;
  return CHAIN;
}
export function ready(callback) {
  Lifecycle.readyCallbacks[Lifecycle.readyCallbacks.length] = callback;
  if (LOADED) {
    callback(new ChangedElements([document.body]));
  }
  return CHAIN;
}
export function load(callback) {
  Lifecycle.loadCallbacks[Lifecycle.loadCallbacks.length] = callback;
  if (LOADED) {
    callback(new ChangedElements([document.body]));
  }
  return CHAIN;
}
export function enter(callback) {
  const { enterCallbacks } = Lifecycle.current;
  enterCallbacks[enterCallbacks.length] = callback;
  if (LOADED) {
    callback(new ChangedElements([document.body]));
  }
  return CHAIN;
}
export function exit(callback) {
  const { exitCallbacks } = Lifecycle.current;
  exitCallbacks[exitCallbacks.length] = callback;
  return CHAIN;
}
export function unload(callback) {
  Lifecycle.unloadCallbacks[Lifecycle.unloadCallbacks.length] = callback;
  return CHAIN;
}
export function route(requestUrl, outletSelectors) {
  try {
    route$(requestUrl, outletSelectors);
  } catch (reason) {
    console.warn(reason);
    if (!CONFIGURE.development) {
      location.replace(requestUrl);
    }
    return null;
  }
}
export function changed(changedElements = [document.body]) {
  const changedElements_ = new ChangedElements(changedElements);
  const end = Lifecycle.loadCallbacks.length;
  let current = -1;
  while (++current < end) {
    Lifecycle.loadCallbacks[current](changedElements_);
  }
  return CHAIN;
}
function tag(tagName) {
  return document.createElement(tagName);
}
function fragmentHtml(html) {
  const fragment = document.createDocumentFragment();
  const fragmentHtml2 = tag("html");
  fragment.appendChild(fragmentHtml2);
  fragmentHtml2.innerHTML = html;
  return fragmentHtml2;
}
function route$(requestUrl, outletSelectors = void 0, push = true) {
  const { entries: styleEntries, urls: styleUrls } = getStyles(documentElement);
  const { entries: scriptEntries, urls: scriptUrls } = getScripts(documentElement);
  let end = styleEntries.length;
  let current = -1;
  while (++current < end) {
    const [node, url] = styleEntries[current];
    RENDERED_STYLES[url] = node;
  }
  end = scriptEntries.length;
  current = -1;
  while (++current < end) {
    const [node, url] = scriptEntries[current];
    RENDERED_SCRIPTS[url] = node;
    document.head.append(node);
  }
  const page = PAGES[CURRENT_URL];
  page.url = START_URL;
  page.title = document.title;
  page.styles = styleUrls;
  page.scripts = scriptUrls;
  page.classes = getClassNameMap(document);
  const { links } = document;
  current = links.length;
  while (current-- > 0) {
    const anchor = links[current];
    const href = anchor.getAttribute("href");
    if (!href || !(href.startsWith("./") || href.startsWith("../"))) {
      continue;
    }
    anchor.setAttribute("href", anchor.href);
  }
  return (route$ = routeAfterFirstRouted).apply(this, arguments);
  function routeAfterFirstRouted(requestUrl2, outletSelectors2 = void 0, push2 = true) {
    debug(requestUrl2);
    if (LOADED) {
      const lifecycle = Lifecycle.current;
      const callbacks = lifecycle.exitCallbacks.concat(Lifecycle.unloadCallbacks);
      const end2 = callbacks.length;
      let current2 = -1;
      try {
        while (++current2 < end2) {
          callbacks[current2]();
        }
      } catch (reason) {
        console.warn(reason);
      }
    } else if (ABORT_CONTROLLER) {
      ABORT_CONTROLLER.abort();
    }
    window.scrollTo(0, 0);
    if (!CONFIGURE.disableTitleReset) {
      document.title = requestUrl2.substring(requestUrl2.indexOf(":") + 3);
    }
    LOADED = false;
    CURRENT_URL = getCurrentUrl(requestUrl2);
    CURRENT_SCRIPT_URL = getLifecycleUrl(requestUrl2);
    const page2 = PAGES[CURRENT_URL];
    if (page2) {
      if (CONFIGURE.enableKeepHtml) {
        push2 && pushState(getFixedUrl2(page2.url, requestUrl2));
        return render$(page2);
      }
      return request(requestUrl2).then(([responseUrl, html]) => {
        page2.html = html;
        push2 && pushState(responseUrl);
        return render$(page2);
      });
    }
    return request(requestUrl2).then(([responseUrl, html]) => {
      push2 && pushState(responseUrl);
      return parse$(requestUrl2, responseUrl, html);
    });
  }
  function request(href) {
    ABORT_CONTROLLER = new AbortController();
    return fetch(href, {
      signal: ABORT_CONTROLLER.signal
    }).then(responseText).catch(catchError);
  }
  function responseText(response) {
    const { url } = response;
    return Promise.all([
      Promise.resolve(url),
      response.text()
    ]);
  }
  function catchError(reason) {
    console.warn(reason);
  }
  function pushState(responseUrl) {
    history.pushState(new State(responseUrl), responseUrl, responseUrl);
  }
  function getFixedUrl2(responseUrl, requestUrl2) {
    const parsedResponseUrl = new URL(responseUrl);
    const parsedRequestUrl = new URL(requestUrl2);
    parsedResponseUrl.search = parsedRequestUrl.search;
    parsedResponseUrl.hash = parsedRequestUrl.hash;
    return "" + parsedRequestUrl;
  }
}
function getClassNameMap(target) {
  const { classSelectors } = CONFIGURE;
  if (classSelectors) {
    const classes = {};
    let current = classSelectors.length;
    while (current-- > 0) {
      const selector = classSelectors[current];
      classes[selector] = (target.querySelector(selector) || {}).className || "";
    }
    return classes;
  }
  return void 0;
}
function parse$(requestUrl, responseUrl, rawHtml) {
  const fragment = fragmentHtml(rawHtml);
  const title = (fragment.getElementsByTagName("TITLE")[0] || {}).innerText || requestUrl;
  const { urls: styleUrls } = getStyles(fragment);
  const { entries: scriptEntries, urls: scriptUrls } = getScripts(fragment);
  let current = scriptEntries.length;
  while (current-- > 0) {
    const [node] = scriptEntries[current];
    if (node?.parentNode) {
      node.parentNode.removeChild(node);
    }
  }
  let html = fragment.outerHTML;
  const page = new Page(responseUrl, title, styleUrls, scriptUrls, getClassNameMap(fragment), html);
  const url = new URL(CURRENT_URL);
  if (url.pathname.endsWith("/")) {
    url.pathname = url.pathname.substring(0, url.pathname.length - 1);
  }
  PAGES["" + url] = page;
  return render$(page);
}
function getUrl(url) {
  if (url.endsWith("/") || _INDEX.test(url)) {
    return url.substring(0, url.lastIndexOf("/"));
  }
  return url;
}
function getCurrentUrl(href) {
  const url = new URL(href);
  if (!CONFIGURE.enableHashString) {
    url.hash = "";
  }
  if (!CONFIGURE.enableSearchString) {
    url.search = "";
  }
  url.pathname = getUrl(url.pathname);
  return "" + url;
}
function getLifecycleUrl(href) {
  const url = new URL(href);
  url.hash = "";
  url.search = "";
  let { pathname } = url;
  if (_ROOT_INDEX.test(pathname)) {
    url.pathname = "";
  } else if (pathname.endsWith("/")) {
    url.pathname = pathname.substring(0, pathname.length - 1);
  }
  return "" + url;
}
function render$(page) {
  const { url, title, styles, scripts, classes, html } = page;
  const { outletSelectors, classSelectors } = CONFIGURE;
  if (!CONFIGURE.disableTitleChange) {
    document.title = title || url.substring(url.indexOf("://") + 3);
  }
  if (classSelectors && classes) {
    let current2 = classSelectors.length;
    while (current2-- > 0) {
      const selector = classSelectors[current2];
      const target = documentElement.querySelector(selector);
      if (target) {
        target.className = classes[selector];
      }
    }
  }
  const fragment = fragmentHtml(html);
  let changeAll = false;
  let changedElements;
  if (outletSelectors) {
    const currentElements = document.querySelectorAll(outletSelectors);
    changedElements = Array.from(fragment.querySelectorAll(outletSelectors));
    if (changedElements.length === currentElements.length) {
      let current2 = changedElements.length;
      while (current2-- > 0) {
        const fragmentElement = changedElements[current2];
        const currentElement = currentElements[current2];
        if (fragmentElement.tagName !== currentElement.tagName) {
          changeAll = true;
          break;
        }
      }
      if (!changeAll) {
        current2 = changedElements.length;
        while (current2-- > 0) {
          const from = changedElements[current2];
          const to = currentElements[current2];
          to.parentNode.replaceChild(from, to);
        }
      }
    } else {
      changeAll = true;
    }
  } else {
    changeAll = true;
  }
  if (changeAll) {
    document.body.innerHTML = (fragment.getElementsByTagName("BODY")[0] || fragment).innerHTML;
    changedElements = [document.body];
  }
  fragment.innerHTML = "";
  const elements = [];
  const importPromises = [Promise.resolve()];
  const removeStyles = [];
  let end;
  let current;
  if (!CONFIGURE.enableKeepStyles) {
    const renderedStyleHrefs = KEYS(RENDERED_STYLES);
    current = renderedStyleHrefs.length;
    while (current-- > 0) {
      let href = renderedStyleHrefs[current];
      if (styles.indexOf(href) > -1) {
        continue;
      }
      removeStyles[removeStyles.length] = RENDERED_STYLES[href];
      delete RENDERED_STYLES[href];
    }
  }
  end = styles.length;
  current = -1;
  while (++current < end) {
    const href = styles[current];
    if (RENDERED_STYLES[href]) {
      continue;
    }
    const { link, promise } = addStyle(href);
    RENDERED_STYLES[href] = link;
    importPromises[importPromises.length] = promise;
    elements[elements.length] = link;
  }
  end = scripts.length;
  current = -1;
  while (++current < end) {
    const src = scripts[current];
    if (RENDERED_SCRIPTS[src]?.parentNode) {
      continue;
    }
    const { script, promise } = addScript(src);
    RENDERED_SCRIPTS[src] = script;
    importPromises[importPromises.length] = promise;
    elements[elements.length] = script;
  }
  if (elements.length) {
    document.head.append(...elements);
  }
  return Promise.all(importPromises).then(() => {
    let current2 = removeStyles.length;
    while (current2-- > 0) {
      const link = removeStyles[current2];
      if (link && link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }
    return onLoad$(changedElements);
  });
}
function getResources(parentElement, selector, attributeName) {
  const entries = [];
  const urls = [];
  const nodes = FROM(parentElement.querySelectorAll(selector));
  const end = nodes.length;
  let current = -1;
  while (++current < end) {
    const node = nodes[current];
    if (!node.getAttribute(attributeName) || !node[attributeName].startsWith(ORIGIN)) {
      continue;
    }
    const value = getFixedUrl(node, attributeName);
    entries[entries.length] = [node, value];
    urls[urls.length] = value;
  }
  return { entries, urls };
}
function getStyles(parentElement) {
  return getResources(parentElement, "link[rel=stylesheet]", "href");
}
function getScripts(parentElement) {
  return getResources(parentElement, "script[src]", "src");
}
function getFixedUrl(node, attribute) {
  return "" + new URL(node.getAttribute(attribute), location.href);
}
function onLoad$(changedElements) {
  const end = Lifecycle.seriesCallbacks.length;
  let current = -1;
  let series2 = Promise.resolve();
  while (++current < end) {
    const callback = Lifecycle.seriesCallbacks[current];
    series2 = series2.then(() => callback());
  }
  const prepares = [series2];
  current = Lifecycle.parallelCallbacks.length;
  while (current-- > 0) {
    prepares[prepares.length] = Lifecycle.parallelCallbacks[current]();
  }
  Lifecycle.seriesCallbacks = [];
  Lifecycle.parallelCallbacks = [];
  return Promise.all(prepares).then(() => {
    return onLoading$(changedElements);
  }).catch(catchReload);
}
function onLoading$(changedElements) {
  documentElement.style.visibility = "inherit";
  try {
    onLoaded(new ChangedElements(changedElements));
  } catch (reason) {
    console.warn(reason);
  }
  return changedElements;
}
function catchReload(reason) {
  console.warn(reason);
  if (!CONFIGURE.development) {
    location.reload();
  }
}
function onLoaded(changedElements) {
  LOADED = true;
  const lifecycle = Lifecycle.current;
  const callbacks = [
    ...Lifecycle.readyCallbacks.splice(0, Lifecycle.readyCallbacks.length),
    ...Lifecycle.loadCallbacks,
    ...lifecycle.enterCallbacks
  ];
  const end = callbacks.length;
  let current = -1;
  while (++current < end) {
    callbacks[current](changedElements);
  }
}
addEventListener("click", function singularOnClick(event) {
  let node = event.target;
  switch (node.tagName) {
    case "BODY":
      return false;
    case "A":
      break;
    default:
      if (node._singularAnchor === false) {
        return true;
      }
      const anchor = node.closest("a");
      if (!anchor || !anchor.href) {
        node._singularAnchor = false;
        return true;
      }
      node = anchor;
  }
  const { href } = node;
  const rawHref = node.getAttribute("href");
  if (node.target || node.download || !href.startsWith(ORIGIN) || rawHref && rawHref.startsWith("#")) {
    node._singularAnchor = false;
    return true;
  }
  node._singularAnchor = node;
  event.stopPropagation();
  event.preventDefault();
  route(href, node.dataset?.outlet || void 0);
  return false;
});
addEventListener("popstate", function singularOnPopstate(event) {
  const { state } = event;
  if (state && state.singular) {
    route$(state.singular.href, void 0, false).then();
  }
  return true;
});
addEventListener("DOMContentLoaded", function singularOnDOMContentLoaded() {
  PAGES[CURRENT_URL].html = documentElement.outerHTML;
  onLoad$([documentElement]).then();
});
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
  const currentPath = getUrl(location.href.substring(ORIGIN_LENGTH));
  const anchors = container.getElementsByTagName("A");
  let current = anchors.length;
  while (current-- > 0) {
    let anchor = anchors[current];
    const href = getUrl(anchor.href.substring(ORIGIN_LENGTH));
    console.log(currentPath, href, anchor);
    if (currentPath !== href) {
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
export function setActiveLink(selector) {
  return load(() => {
    activateSelector(selector);
  }).unload(inactivateAnchors);
}
export function setPathClass({ prefix, baseHref }) {
  if (!prefix) {
    prefix = "path";
  }
  if (!baseHref) {
    baseHref = "";
  }
  let offset = baseHref.length;
  if (!baseHref.endsWith("/")) {
    offset++;
  }
  const { classList } = documentElement;
  let lastClassNames;
  load(() => {
    let { pathname } = location;
    if (_INDEX.test(pathname)) {
      pathname = pathname.substring(0, pathname.lastIndexOf("."));
    } else if (pathname.endsWith("/")) {
      pathname = pathname.substring(0, pathname.length - 1);
    }
    const classNames = [];
    const classNamePrefixes = [prefix];
    const segments = (pathname.slice(offset) || "index").split("/");
    const end = segments.length;
    let current = -1;
    while (++current < end) {
      const segment = segments[current];
      let lastCurrent = classNamePrefixes.length;
      while (lastCurrent-- > 0) {
        const lastClassName = classNamePrefixes[lastCurrent];
        let className = lastClassName + "_" + segment;
        classNames[classNames.length] = className;
        classNamePrefixes[lastCurrent] = className;
        if (+segment == segment) {
          className = lastClassName + "_*";
          classNames[classNames.length] = className;
          classNamePrefixes[classNamePrefixes.length] = className;
        }
      }
    }
    classList.add(...classNames);
    lastClassNames = classNames;
  });
  unload(() => {
    classList.remove(...lastClassNames);
  });
}
