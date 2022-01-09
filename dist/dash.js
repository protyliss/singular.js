"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var dash = function (window, document, undefined) {
  var _location = location,
      START_PATH = _location.href,
      ORIGIN = _location.origin;
  var FROM = Array.from;
  var READY_CALLBACKS = [];
  var LOAD_CALLBACKS = [];
  var UNLOAD_CALLBACKS = [];
  var CONFIGURE = {
    development: false,
    htmlSelectors: null,
    classSelectors: null,
    enableKeepHtml: false,
    enableKeepStyles: false,
    enableSearchString: false,
    enableHashString: false
  };

  var FRAGMENT_HTML = function () {
    var fragment = document.createDocumentFragment();
    var fragmentHtml = document.createElement('html');
    fragment.appendChild(fragmentHtml);
    return fragmentHtml;
  }();

  var HTML;
  var HEAD;
  var BODY;
  var START_HTML;
  var SERIES_CALLBACKS = [];
  var PARALLEL_CALLBACKS = [];
  var RENDERED_STYLES = {};
  var RENDERED_SCRIPTS = {};
  var LOADED = false;
  var CURRENT_PATH = START_PATH;
  var FETCH_CONTROLLER;

  var Page = /*#__PURE__*/_createClass(function Page() {
    _classCallCheck(this, Page);

    _defineProperty(this, "title", void 0);

    _defineProperty(this, "styles", void 0);

    _defineProperty(this, "scripts", void 0);

    _defineProperty(this, "enterCallbacks", []);

    _defineProperty(this, "exitCallbacks", []);

    _defineProperty(this, "classes", void 0);

    _defineProperty(this, "html", void 0);
  });

  var State = /*#__PURE__*/_createClass(function State(href) {
    _classCallCheck(this, State);

    _defineProperty(this, "dash", void 0);

    this.dash = {
      href: href
    };
  });

  var PAGES = _defineProperty({}, START_PATH, new Page());
  /**
   * @alias dash.enter
   * @param callback
   */


  function dash(callback) {
    return dash.enter(callback);
  }
  /**
   * Set Configure
   * @param configure
   */


  dash.configure = function (configure) {
    if (configure.htmlSelectors) {
      if (typeof configure.htmlSelectors === 'string') {
        configure.htmlSelectors = [configure.htmlSelectors];
      }

      if (configure.htmlSelectors.indexOf('body') > -1) {
        configure.htmlSelectors = null;
      }
    }

    if (configure.classSelectors) {
      if (typeof configure.classSelectors === 'string') {
        configure.classSelectors = [configure.classSelectors];
      }
    }

    var keys = Object.keys(configure);
    var current = keys.length;

    while (current-- > 0) {
      var key = keys[current];
      CONFIGURE[key] = configure[key];
    }

    return dash;
  };
  /**
   * Set Series Callback for Bootstrap
   * @description
   *   Callbacks Call as Single Thread
   *   If Previous Callback to failed, Does not Move to Next Callback.
   * @param callback
   */


  dash.series = function (callback) {
    SERIES_CALLBACKS[SERIES_CALLBACKS.length] = callback;
    return dash;
  };
  /**
   * Set Parallel Callback for Bootstrap
   * @description
   *   Callbacks Call as Multiple Thread
   * @param callback
   */


  dash.parallel = function (callback) {
    PARALLEL_CALLBACKS[PARALLEL_CALLBACKS.length] = callback;
    return dash;
  };
  /**
   * Add External Stylesheet to <HEAD> Using <LINK>
   * @param href
   */


  dash.addStyle = function (href) {
    var link = document.createElement('link');
    return {
      link: link,
      promise: new Promise(function (resolve) {
        var resolver = function resolver() {
          return resolve();
        };

        link.onload = resolver;
        link.onerror = resolver;
        link.rel = 'stylesheet';
        HEAD.append(link);
        link.href = href;
      })
    };
  };
  /**
   *  Add External Stylesheet to <HEAD> Using <SCRIPT>
   * @param src
   * @param async
   */


  dash.addScript = function (src) {
    var async = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var script = document.createElement('script');
    return {
      script: script,
      promise: new Promise(function (resolve) {
        var resolver = function resolver() {
          return resolve();
        };

        script.onload = resolver;
        script.onerror = resolver;
        script.async = async;
        HEAD.append(script);
        script.src = src;
      })
    };
  };
  /**
   * Run Once in Declared Document after DOMContentLoaded
   * @param callback
   */


  dash.ready = function (callback) {
    READY_CALLBACKS[READY_CALLBACKS.length] = callback;

    if (LOADED) {
      callback(BODY);
    }

    return dash;
  };
  /**
   * Run Everytime in Every Document after DOMContentLoaded
   * @param callback
   */


  dash.load = function (callback) {
    LOAD_CALLBACKS[LOAD_CALLBACKS.length] = callback;

    if (LOADED) {
      callback(BODY);
    }

    return dash;
  };

  dash.unload = function (callback) {
    UNLOAD_CALLBACKS[UNLOAD_CALLBACKS.length] = callback;
    return dash;
  };
  /**
   * Run Everytime in Declared Document after DOMContentLoaded
   * @param callback
   */


  dash.enter = function (callback) {
    var store = PAGES[CURRENT_PATH].enterCallbacks;
    store[store.length] = callback;

    if (LOADED) {
      callback(BODY);
    }

    return dash;
  };
  /**
   * Run Everytime in Declared Document after beforeunload
   * @param callback
   */


  dash.exit = function (callback) {
    var store = PAGES[CURRENT_PATH].exitCallbacks;
    store[store.length] = callback;
    return dash;
  };
  /**
   * Move to Other Document
   * @param href
   * @param htmlSelectors
   */


  dash.route = function (href, htmlSelectors) {
    try {
      route(href, htmlSelectors);
    } catch (reason) {
      console.warn(reason);

      if (!CONFIGURE.development) {
        location.replace(href);
      }

      return null;
    }

    history.pushState(new State(href), href, href);
  };
  /**
   * Signal for DOM Changed by any codes
   * @param target
   */


  dash.changed = function () {
    var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : BODY;
    var end = LOAD_CALLBACKS.length;
    var current = -1;

    while (++current < end) {
      LOAD_CALLBACKS[current](target);
    }

    return dash;
  };

  function route(href, htmlSelectors) {
    var styleElements = getStyleElement(HTML);
    var scriptElements = getScriptElement(HTML);
    var styles = [];
    var scripts = [];
    var current = styleElements.length;

    while (current-- > 0) {
      var style = styleElements[current];
      var _href = style.href;
      styles[styles.length] = _href;
      RENDERED_STYLES[_href] = style;
    }

    current = scriptElements.length;

    while (current-- > 0) {
      var script = scriptElements[current];
      var src = script.src;
      scripts[scripts.length] = src;
      RENDERED_SCRIPTS[script.src] = script;
    }

    var startPage = PAGES[CURRENT_PATH];
    startPage.title = document.title;
    startPage.styles = styles;
    startPage.scripts = scripts;
    startPage.html = START_HTML;
    START_HTML = null;
    var links = document.links;
    current = links.length;

    while (current-- > 0) {
      var anchor = links[current];

      var _href2 = anchor.getAttribute('href');

      if (!_href2 || !(_href2.startsWith('./') || _href2.startsWith('../'))) {
        continue;
      }

      anchor.setAttribute('href', anchor.href);
    } // @ts-ignore


    return (route = function route(href, htmlSelectors) {
      // console.debug(`[dash] ${href}`);
      if (LOADED) {
        var callbacks = PAGES[CURRENT_PATH].exitCallbacks.concat(UNLOAD_CALLBACKS);
        var end = callbacks.length;

        var _current = -1;

        try {
          while (++_current < end) {
            callbacks[_current]();
          }
        } catch (reason) {
          console.warn(reason);
        }
      } else if (FETCH_CONTROLLER) {
        FETCH_CONTROLLER.abort();
      }

      if (!htmlSelectors) {
        htmlSelectors = CONFIGURE.htmlSelectors;
      }

      window.scrollTo(0, 0);
      document.title = href.substring(href.indexOf(':') + 3);
      LOADED = false;
      CURRENT_PATH = getHref(href);
      var cache = PAGES[CURRENT_PATH];

      if (cache) {
        if (CONFIGURE.enableKeepHtml) {
          render(cache);
        } else {
          request(href).then(function (html) {
            cache.html = html;
            render(cache);
          });
        }
      } else {
        request(href).then(function (html) {
          parse(href, html, htmlSelectors);
        });
      }
    }).apply(this, arguments);

    function request(href) {
      FETCH_CONTROLLER = new AbortController();
      return fetch(href, {
        signal: FETCH_CONTROLLER.signal
      }).then(responseText)["catch"](catchError);
    }

    function responseText(response) {
      return response.text();
    }

    function catchError(reason) {
      console.warn(reason);

      if (!(reason instanceof DOMException)) {
        console.warn(reason);
      }
    }
  }

  function parse(href, rawHtml, htmlSelectors) {
    var page = getPage(rawHtml, href, htmlSelectors);
    PAGES[CURRENT_PATH] = page;
    render(page);
  }

  function getHref(href) {
    if (!CONFIGURE.enableHashString) {
      var index = href.indexOf('#');

      if (index > -1) {
        href = href.substring(0, index);
      }
    }

    if (!CONFIGURE.enableSearchString) {
      var searchIndex = href.indexOf('?');
      var hashIndex = href.indexOf('#');

      if (searchIndex > -1) {
        href = href.substring(0, searchIndex) + (hashIndex > -1 ? href.substring(hashIndex) : '');
      }
    }

    return href;
  }

  function getPage(rawHtml, href, htmlSelectors) {
    FRAGMENT_HTML.innerHTML = rawHtml;
    var title = (FRAGMENT_HTML.getElementsByTagName('TITLE')[0] || {}).innerText || href;
    var current;
    var classSelectors = CONFIGURE.classSelectors;
    var classMap = null;

    if (classSelectors) {
      classMap = {};
      current = classSelectors.length;

      while (current-- > 0) {
        var selector = classSelectors[current];
        classMap[selector] = (FRAGMENT_HTML.getElementsByTagName(selector)[0] || {}).className || '';
      }
    }

    var styleElements = getStyleElement(FRAGMENT_HTML);
    var scriptElements = getScriptElement(FRAGMENT_HTML);
    var styles = getStyleHref(styleElements);
    var scripts = getScriptSrc(scriptElements);
    current = scriptElements.length;

    while (current-- > 0) {
      var script = scriptElements[current];

      if (script !== null && script !== void 0 && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }

    var html;

    if (htmlSelectors) {
      var targetHTML = [];
      var _current2 = htmlSelectors.length;

      while (_current2-- > 0) {
        var target = FRAGMENT_HTML.querySelector('#' + htmlSelectors[_current2]);

        if (target) {
          targetHTML[targetHTML.length] = target.outerHTML;
        }
      }

      html = targetHTML.join('');
    } else {
      html = FRAGMENT_HTML.outerHTML;
    }

    var page = new Page();
    page.title = title;
    page.title = title;
    page.styles = styles;
    page.scripts = scripts;
    page.classes = classMap;
    page.html = html;
    return page;
  }

  function render(page) {
    var title = page.title,
        styles = page.styles,
        scripts = page.scripts,
        classes = page.classes,
        html = page.html;

    if (title) {
      document.title = title;
    }

    var htmlSelectors = CONFIGURE.htmlSelectors,
        classSelectors = CONFIGURE.classSelectors;

    if (classSelectors && classes) {
      var _current3 = classSelectors.length;

      while (_current3-- > 0) {
        var selector = classSelectors[_current3];
        var target = HTML.querySelector(selector);

        if (target) {
          target.className = classes[selector];
        }
      }
    }

    FRAGMENT_HTML.innerHTML = html;

    if (htmlSelectors) {
      var _current4 = htmlSelectors.length;

      while (_current4-- > 0) {
        var _selector = htmlSelectors[_current4];
        var from = FRAGMENT_HTML.querySelector('#' + _selector);
        var to = BODY.querySelector('#' + _selector);

        if (from && to) {
          var parent = to.parentNode;
          parent.replaceChild(from, to);
        }
      }
    } else {
      var _BODY;

      BODY.innerHTML = '';

      (_BODY = BODY).append.apply(_BODY, _toConsumableArray((FRAGMENT_HTML.getElementsByTagName('BODY')[0] || FRAGMENT_HTML).children));
    }

    var addScript = dash.addScript,
        addStyle = dash.addStyle;
    var elements = [];
    var imports = [Promise.resolve()];
    var end;
    var current;
    var renderedStyleHrefs = Object.keys(RENDERED_STYLES);
    current = renderedStyleHrefs.length;

    while (current-- > 0) {
      var href = renderedStyleHrefs[current];

      if (styles.indexOf(href) > -1) {
        continue;
      }

      RENDERED_STYLES[href].disabled = true;
    } // add external stylesheet


    end = styles.length;
    current = -1;

    while (++current < end) {
      var _href3 = styles[current];

      if (RENDERED_STYLES[_href3]) {
        RENDERED_STYLES[_href3].disabled = false;
        continue;
      }

      var _addStyle = addStyle(_href3),
          link = _addStyle.link,
          promise = _addStyle.promise;

      RENDERED_STYLES[_href3] = link;
      imports[imports.length] = promise;
      elements[elements.length] = link;
    } // add external script


    end = scripts.length;
    current = -1;

    while (++current < end) {
      var src = scripts[current];

      if (RENDERED_SCRIPTS[src]) {
        continue;
      }

      var _addScript = addScript(src),
          script = _addScript.script,
          _promise = _addScript.promise;

      RENDERED_SCRIPTS[src] = script;
      imports[imports.length] = _promise;
      elements[elements.length] = script;
    }

    if (elements.length) {
      var _HEAD;

      (_HEAD = HEAD).append.apply(_HEAD, elements);
    }

    Promise.all(imports).then(onLoad);
  }

  function getStyleElement(container) {
    var result = [];
    var styles = FROM(container.querySelectorAll('link[rel=stylesheet]'));
    var end = styles.length;
    var current = -1;

    while (++current < end) {
      var link = styles[current];

      if (link.getAttribute('href') && link.href.startsWith(ORIGIN)) {
        result[result.length] = link;
      }
    }

    return result;
  }

  function getStyleHref(styles) {
    var result = [];
    var current = styles.length;

    while (current-- > 0) {
      result[result.length] = getAbsoluteUrl(styles[current], 'href');
    }

    return result;
  }

  function getScriptElement(container) {
    var result = [];
    var scripts = container.querySelectorAll('script[src]');
    var end = scripts.length;
    var current = -1;

    while (++current < end) {
      var script = scripts[current];

      if (script.getAttribute('src') && script.src.startsWith(ORIGIN)) {
        result[result.length] = script;
      }
    }

    return result;
  }

  function getScriptSrc(scripts) {
    var result = [];
    var current = scripts.length;

    while (current-- > 0) {
      result[result.length] = getAbsoluteUrl(scripts[current], 'src');
    }

    return result;
  }

  function getAbsoluteUrl(node, attribute) {
    return '' + new URL(node.getAttribute(attribute), CURRENT_PATH);
  }

  function onLoad() {
    // console.debug('[dash] before load');
    var end = SERIES_CALLBACKS.length;
    var current = -1;
    var series = Promise.resolve();

    while (++current < end) {
      series = series.then(function () {
        return SERIES_CALLBACKS[current]();
      });
    }

    var prepares = [series];
    current = PARALLEL_CALLBACKS.length;

    while (current-- > 0) {
      prepares[prepares.length] = PARALLEL_CALLBACKS[current]();
    }

    SERIES_CALLBACKS = [];
    PARALLEL_CALLBACKS = [];
    Promise.all(prepares).then(onLoading)["catch"](catchReload);
  }

  function onLoading() {
    // console.debug('[dash] after load');
    HTML.style.visibility = 'inherit';

    try {
      onLoaded();
    } catch (reason) {
      console.warn(reason);
    }
  }

  function catchReload(reason) {
    console.warn(reason);

    if (!CONFIGURE.development) {
      location.reload();
    }
  }

  function onLoaded() {
    var changedElement = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : BODY;
    // console.debug('[dash] Loaded');
    LOADED = true;
    var store = PAGES[CURRENT_PATH];
    var callbacks = READY_CALLBACKS.concat(LOAD_CALLBACKS, store.enterCallbacks);
    var end = callbacks.length;
    var current = -1;

    while (++current < end) {
      callbacks[current](changedElement);
    }
  }

  addEventListener('click', function onClick(event) {
    var _node4, _node4$dataset;

    var node = event.target;
    var _node = node,
        tagName = _node.tagName;

    if (tagName === 'BODY') {
      return false;
    }

    if (tagName !== 'A') {
      var _node2;

      if (((_node2 = node) === null || _node2 === void 0 ? void 0 : _node2._dashAnchor) === false) {
        return true;
      }

      var anchor = node.closest('a');

      if (!anchor || !anchor.href) {
        node._dashAnchor = false;
        return true;
      }

      node = anchor;
    }

    var _node3 = node,
        href = _node3.href;
    var rawHref = node.getAttribute('href');

    if (!href.startsWith(ORIGIN) || node.download || rawHref && rawHref.startsWith('#')) {
      node._dashAnchor = false;
      return true;
    }

    node._dashAnchor = node;
    var inlineOutlet = (_node4 = node) === null || _node4 === void 0 ? void 0 : (_node4$dataset = _node4.dataset) === null || _node4$dataset === void 0 ? void 0 : _node4$dataset.outlet;
    dash.route(node.href, inlineOutlet ? inlineOutlet.split(',') : undefined);
    event.stopPropagation();
    event.preventDefault();
    return false;
  });
  addEventListener('popstate', function onPopstate(event) {
    var state = event.state;

    if (state instanceof State) {
      route(state.dash.href);
    }

    return true;
  });
  addEventListener('DOMContentLoaded', function onDOMContentLoaded() {
    HTML = document.documentElement;
    HEAD = document.head;
    BODY = document.body;
    START_HTML = HTML.outerHTML;
    CURRENT_PATH = getHref(START_PATH);

    if (CURRENT_PATH !== START_PATH) {
      PAGES[CURRENT_PATH] = PAGES[START_PATH];
      delete PAGES[START_PATH];
    }

    HTML.style.visibility = 'hidden';
    onLoad();
  });
  return dash;
}(window, document);