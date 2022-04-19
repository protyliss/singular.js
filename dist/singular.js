"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var singular = function singularInit(window, document, undefined) {
  var _location = location,
      START_PATH = _location.href,
      ORIGIN = _location.origin;
  var FROM = Array.from;
  var READY_CALLBACKS = [];
  var LOAD_CALLBACKS = [];
  var UNLOAD_CALLBACKS = [];
  var CONFIGURE = {
    development: false,
    elementIds: null,
    classSelectors: null,
    enableKeepHtml: false,
    enableKeepStyles: false,
    enableSearchString: false,
    enableHashString: false
  };
  var START_HTML = document.documentElement.outerHTML;
  var SERIES_CALLBACKS = [];
  var PARALLEL_CALLBACKS = [];
  var RENDERED_STYLES = {};
  var RENDERED_SCRIPTS = {};
  var LOADED = false;
  var CURRENT_PATH = START_PATH;
  var ABORTER;

  var Page = /*#__PURE__*/_createClass(function Page() {
    _classCallCheck(this, Page);

    _defineProperty(this, "url", void 0);

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

    _defineProperty(this, "singular", void 0);

    this.singular = {
      href: href
    };
  });

  var PAGES = _defineProperty({}, START_PATH, new Page());

  addEventListener('click', function singularOnClick(event) {
    var _node$dataset;

    var node = event.target;

    switch (node.tagName) {
      case 'BODY':
        return false;

      case 'A':
        break;

      default:
        if (node._singularAnchor === false) {
          return true;
        }

        var anchor = node.closest('a');

        if (!anchor || !anchor.href) {
          node._singularAnchor = false;
          return true;
        }

        node = anchor;
    }

    var _node = node,
        href = _node.href;
    var rawHref = node.getAttribute('href');

    if (!href.startsWith(ORIGIN) || node.download || rawHref && rawHref.startsWith('#')) {
      node._singularAnchor = false;
      return true;
    }

    node._singularAnchor = node;
    event.stopPropagation();
    event.preventDefault();
    var inlineOutlet = (_node$dataset = node.dataset) === null || _node$dataset === void 0 ? void 0 : _node$dataset.outlet;
    singular.route(href, inlineOutlet ? inlineOutlet.split(',') : undefined);
    return false;
  });
  addEventListener('popstate', function singularOnPopstate(event) {
    var state = event.state;

    if (state && state.singular) {
      _route(state.singular.href);
    }

    return true;
  });
  addEventListener('DOMContentLoaded', function singularOnDOMContentLoaded() {
    CURRENT_PATH = getHref(START_PATH);

    if (START_PATH !== CURRENT_PATH) {
      PAGES[CURRENT_PATH] = PAGES[START_PATH];
      delete PAGES[START_PATH];
    }

    document.documentElement.style.visibility = 'hidden';
    onLoad();
  });
  return /*#__PURE__*/function () {
    function Singular() {
      _classCallCheck(this, Singular);
    }

    _createClass(Singular, null, [{
      key: "configure",
      value:
      /**
       * Set Configure
       * @param configure
       */
      function configure(_configure) {
        var elementIds = _configure.elementIds,
            classSelectors = _configure.classSelectors;

        if (elementIds) {
          if (typeof elementIds === 'string') {
            _configure.elementIds = [elementIds];
          }

          if (elementIds.indexOf('body') > -1) {
            _configure.elementIds = null;
          }
        }

        if (classSelectors) {
          if (typeof classSelectors === 'string') {
            _configure.classSelectors = [classSelectors];
          }
        }

        CONFIGURE = Object.assign(CONFIGURE, _configure);
        return this;
      }
      /**
       * Add External Stylesheet to <HEAD> Using <LINK>
       * @param href
       */

    }, {
      key: "addStyle",
      value: function addStyle(href) {
        var link = tag('link');
        return {
          link: link,
          promise: new Promise(function (resolve) {
            var resolver = function resolver() {
              return resolve();
            };

            link.onload = resolver;
            link.onerror = resolver;
            link.rel = 'stylesheet';
            document.head.append(link);
            link.href = href;
          })
        };
      }
    }, {
      key: "addScript",
      value:
      /**
       *  Add External Stylesheet to <HEAD> Using <SCRIPT>
       * @param src
       * @param async
       */
      function addScript(src) {
        var async = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var script = tag('script');
        return {
          script: script,
          promise: new Promise(function (resolve) {
            var resolver = function resolver() {
              return resolve();
            };

            script.onload = resolver;
            script.onerror = resolver;
            script.async = async;
            document.head.append(script);
            script.src = src;
          })
        };
      }
    }, {
      key: "parallel",
      value:
      /**
       * Set Parallel Callback for Bootstrap
       * @description
       *   Callbacks Call as Multiple Thread
       * @param callback
       */
      function parallel(callback) {
        PARALLEL_CALLBACKS[PARALLEL_CALLBACKS.length] = callback;
        return this;
      }
      /**
       * Set Series Callback for Bootstrap
       * @description
       *   Callbacks Call as Single Thread
       *   If Previous Callback to failed, Does not Move to Next Callback.
       * @param callback
       */

    }, {
      key: "series",
      value: function series(callback) {
        SERIES_CALLBACKS[SERIES_CALLBACKS.length] = callback;
        return this;
      }
      /**
       * Run Once in Declared Document after DOMContentLoaded
       * @param callback
       */

    }, {
      key: "ready",
      value: function ready(callback) {
        READY_CALLBACKS[READY_CALLBACKS.length] = callback;

        if (LOADED) {
          callback(document.body);
        }

        return this;
      }
      /**
       * Run Everytime in Every Document after DOMContentLoaded
       * @param callback
       */

    }, {
      key: "load",
      value: function load(callback) {
        LOAD_CALLBACKS[LOAD_CALLBACKS.length] = callback;

        if (LOADED) {
          callback(document.body);
        }

        return this;
      }
      /**
       * Run Everytime in Declared Document after DOMContentLoaded
       * @alias singular
       * @param callback
       */

    }, {
      key: "enter",
      value: function enter(callback) {
        var store = PAGES[CURRENT_PATH].enterCallbacks;
        store[store.length] = callback;

        if (LOADED) {
          callback(document.body);
        }

        return this;
      }
      /**
       * Run Everytime in Declared Document after beforeunload
       * @param callback
       */

    }, {
      key: "exit",
      value: function exit(callback) {
        var exitCallbacks = PAGES[CURRENT_PATH].exitCallbacks;
        exitCallbacks[exitCallbacks.length] = callback;
        return this;
      }
    }, {
      key: "unload",
      value: function unload(callback) {
        UNLOAD_CALLBACKS[UNLOAD_CALLBACKS.length] = callback;
        return this;
      }
      /**
       * Move to Other Document
       * @param requestUrl
       * @param elementIds
       */

    }, {
      key: "route",
      value: function route(requestUrl, elementIds) {
        try {
          _route(requestUrl, elementIds);
        } catch (reason) {
          console.warn(reason);

          if (!CONFIGURE.development) {
            location.replace(requestUrl);
          }

          return null;
        }
      }
      /**
       * Signal for DOM Changed by any codes
       * @param target
       */

    }, {
      key: "changed",
      value: function changed() {
        var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.body;
        var end = LOAD_CALLBACKS.length;
        var current = -1;

        while (++current < end) {
          LOAD_CALLBACKS[current](target);
        }

        return this;
      }
    }]);

    return Singular;
  }();

  function tag(tagName) {
    return document.createElement(tagName);
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function fragmentHtml(html) {
    var fragment = document.createDocumentFragment();
    var fragmentHtml = tag('html');
    fragment.appendChild(fragmentHtml);
    fragmentHtml.innerHTML = html;
    return fragmentHtml;
  }

  function _route(requestUrl, elementIds) {
    var _getStyles = getStyles(document.documentElement),
        styleEntries = _getStyles.entries,
        styleUrls = _getStyles.urls;

    var _getScripts = getScripts(document.documentElement),
        scriptEntries = _getScripts.entries,
        scriptUrls = _getScripts.urls;

    var end = styleEntries.length;
    var current = -1;

    while (++current > end) {
      var _styleEntries$current = _slicedToArray(styleEntries[current], 2),
          node = _styleEntries$current[0],
          url = _styleEntries$current[1];

      RENDERED_STYLES[url] = node;
    }

    end = scriptEntries.length;
    current = -1;

    while (++current < end) {
      var _scriptEntries$curren = _slicedToArray(scriptEntries[current], 2),
          _node2 = _scriptEntries$curren[0],
          _url = _scriptEntries$curren[1];

      RENDERED_SCRIPTS[_url] = _node2;
      document.head.append(_node2);
    }

    var page = PAGES[getHref(START_PATH)];
    page.url = START_PATH;
    page.title = document.title;
    page.styles = styleUrls;
    page.scripts = scriptUrls;
    page.html = START_HTML;
    START_HTML = null;
    var links = document.links;
    current = links.length;

    while (current-- > 0) {
      var anchor = links[current];
      var href = anchor.getAttribute('href');

      if (!href || !(href.startsWith('./') || href.startsWith('../'))) {
        continue;
      }

      anchor.setAttribute('href', anchor.href);
    } // @ts-ignore


    return (_route = routeAfterFirstRouted).apply(this, arguments);

    function routeAfterFirstRouted(requestUrl, elementIds) {
      // console.debug(`[singular] ${href}`);
      if (LOADED) {
        var callbacks = PAGES[CURRENT_PATH].exitCallbacks.concat(UNLOAD_CALLBACKS);
        var _end = callbacks.length;

        var _current = -1;

        try {
          while (++_current < _end) {
            callbacks[_current]();
          }
        } catch (reason) {
          console.warn(reason);
        }
      } else if (ABORTER) {
        ABORTER.abort();
      }

      window.scrollTo(0, 0); // document.title = requestUrl.substring(requestUrl.indexOf(':') + 3);

      LOADED = false;
      CURRENT_PATH = getHref(requestUrl);
      var page = PAGES[CURRENT_PATH];

      if (page) {
        if (CONFIGURE.enableKeepHtml) {
          render(page);
          pushState(page.url);
        } else {
          // noinspection JSUnusedLocalSymbols
          request(requestUrl).then(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                responseUrl = _ref2[0],
                html = _ref2[1];

            page.html = html;
            render(page);
          });
        }
      } else {
        request(requestUrl).then(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2),
              responseUrl = _ref4[0],
              html = _ref4[1];

          parse(requestUrl, responseUrl, html, elementIds || CONFIGURE.elementIds);
        });
      }
    }

    function request(href) {
      ABORTER = new AbortController();
      return fetch(href, {
        signal: ABORTER.signal
      }).then(responseText)["catch"](catchError);
    }

    function responseText(response) {
      var url = response.url;
      pushState(url);
      return Promise.all([Promise.resolve(url), response.text()]);
    }

    function catchError(reason) {
      console.warn(reason);
    }

    function pushState(url) {
      history.pushState(new State(url), url, url);
    }
  }

  function parse(requestUrl, responseUrl, rawHtml, elementIds) {
    var fragment = fragmentHtml(rawHtml);
    var title = (fragment.getElementsByTagName('TITLE')[0] || {}).innerText || requestUrl;
    var _CONFIGURE = CONFIGURE,
        classSelectors = _CONFIGURE.classSelectors;
    var current;
    var classMap = null;

    if (classSelectors) {
      classMap = {};
      current = classSelectors.length;

      while (current-- > 0) {
        var selector = classSelectors[current];
        classMap[selector] = (fragment.getElementsByTagName(selector)[0] || {}).className || '';
      }
    }

    var _getStyles2 = getStyles(fragment),
        styleUrls = _getStyles2.urls;

    var _getScripts2 = getScripts(fragment),
        scriptEntries = _getScripts2.entries,
        scriptUrls = _getScripts2.urls;

    current = scriptEntries.length;

    while (current-- > 0) {
      var _scriptEntries$curren2 = _slicedToArray(scriptEntries[current], 1),
          node = _scriptEntries$curren2[0];

      if (node !== null && node !== void 0 && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }

    var html;

    if (elementIds) {
      var targetHTML = [];
      var _current2 = elementIds.length;

      while (_current2-- > 0) {
        var target = fragment.querySelector('#' + elementIds[_current2]);

        if (target) {
          targetHTML[targetHTML.length] = target.outerHTML;
        }
      }

      html = targetHTML.join('');
    } else {
      html = fragment.outerHTML;
    }

    var page = new Page();
    page.url = responseUrl;
    page.title = title;
    page.styles = styleUrls;
    page.scripts = scriptUrls;
    page.classes = classMap;
    page.html = html;
    var url = new URL(CURRENT_PATH);

    if (url.pathname.endsWith('/')) {
      url.pathname = url.pathname.substring(0, url.pathname.length - 1);
    }

    PAGES['' + url] = page;
    render(page);
  }

  function getHref(href) {
    var url = new URL(href);

    if (!CONFIGURE.enableHashString) {
      url.hash = '';
    }

    if (!CONFIGURE.enableSearchString) {
      url.search = '';
    }

    var pathname = url.pathname;

    if (pathname.endsWith('/')) {
      url.pathname = pathname.substring(0, pathname.length - 1);
    }

    return '' + url;
  }

  function getScriptUrl(href) {}

  function render(page) {
    var url = page.url,
        title = page.title,
        styles = page.styles,
        scripts = page.scripts,
        classes = page.classes,
        html = page.html;
    var _CONFIGURE2 = CONFIGURE,
        elementIds = _CONFIGURE2.elementIds,
        classSelectors = _CONFIGURE2.classSelectors;
    document.title = title || url.substring(url.indexOf('://') + 3);

    if (classSelectors && classes) {
      var _current3 = classSelectors.length;

      while (_current3-- > 0) {
        var selector = classSelectors[_current3];
        var target = document.documentElement.querySelector(selector);

        if (target) {
          target.className = classes[selector];
        }
      }
    }

    var fragment = fragmentHtml(html);
    var changeAll = false;

    if (elementIds) {
      var replaceMap = [];
      var _current4 = elementIds.length;

      while (_current4-- > 0) {
        var _selector = elementIds[_current4];
        var from = fragment.querySelector('#' + _selector);
        var to = byId(_selector);

        if (!from || !to) {
          changeAll = true;
          break;
        }

        replaceMap[replaceMap.length] = [from, to];
      }

      if (!changeAll) {
        _current4 = replaceMap.length;

        while (_current4-- > 0) {
          var _replaceMap$_current = _slicedToArray(replaceMap[_current4], 2),
              _from = _replaceMap$_current[0],
              _to = _replaceMap$_current[1];

          _to.parentNode.replaceChild(_from, _to);
        }
      }
    } else {
      changeAll = true;
    }

    if (changeAll) {
      var _document$body;

      document.body.innerHTML = '';

      (_document$body = document.body).append.apply(_document$body, _toConsumableArray((fragment.getElementsByTagName('BODY')[0] || fragment).children));
    }

    fragment.innerHTML = '';
    var addScript = singular.addScript,
        addStyle = singular.addStyle;
    var elements = [];
    var importPromises = [Promise.resolve()];
    var removeStyles = [];
    var end;
    var current;

    if (!CONFIGURE.enableKeepStyles) {
      var renderedStyleHrefs = Object.keys(RENDERED_STYLES);
      current = renderedStyleHrefs.length;

      while (current-- > 0) {
        var href = renderedStyleHrefs[current];

        if (styles.indexOf(href) > -1) {
          continue;
        } // RENDERED_STYLES[href].disabled = true;


        removeStyles[removeStyles.length] = RENDERED_STYLES[href];
        delete RENDERED_STYLES[href];
      }
    } // add external stylesheet


    end = styles.length;
    current = -1;

    while (++current < end) {
      var _href = styles[current];

      if (RENDERED_STYLES[_href]) {
        //     RENDERED_STYLES[href].disabled = false;
        continue;
      }

      var _addStyle = addStyle(_href),
          link = _addStyle.link,
          promise = _addStyle.promise;

      RENDERED_STYLES[_href] = link;
      importPromises[importPromises.length] = promise;
      elements[elements.length] = link;
    } // add external script


    end = scripts.length;
    current = -1;

    while (++current < end) {
      var _RENDERED_SCRIPTS$src;

      var src = scripts[current];

      if ((_RENDERED_SCRIPTS$src = RENDERED_SCRIPTS[src]) !== null && _RENDERED_SCRIPTS$src !== void 0 && _RENDERED_SCRIPTS$src.parentNode) {
        // console.log(RENDERED_SCRIPTS[src], RENDERED_SCRIPTS[src].parentNode);
        continue;
      }

      var _addScript = addScript(src),
          script = _addScript.script,
          _promise = _addScript.promise;

      RENDERED_SCRIPTS[src] = script;
      importPromises[importPromises.length] = _promise;
      elements[elements.length] = script;
    }

    if (elements.length) {
      var _document$head;

      (_document$head = document.head).append.apply(_document$head, elements);
    }

    Promise.all(importPromises).then(function () {
      var current = removeStyles.length;

      while (current-- > 0) {
        var _link = removeStyles[current];

        if (_link && _link.parentNode) {
          _link.parentNode.removeChild(_link);
        }
      }

      onLoad();
    });
  }

  function getResources(parentElement, selector, attributeName) {
    var entries = [];
    var urls = [];
    var nodes = FROM(parentElement.querySelectorAll(selector));
    var end = nodes.length;
    var current = -1;

    while (++current < end) {
      var node = nodes[current];

      if (!node.getAttribute(attributeName) || node[attributeName].startsWith(ORIGIN)) {
        continue;
      }

      var value = getFixedUrl(node, attributeName);
      entries[entries.length] = [node, value];
      urls[urls.length] = value;
    }

    return {
      entries: entries,
      urls: urls
    };
  }

  function getStyles(parentElement) {
    return getResources(parentElement, 'link[rel=stylesheet]', 'href');
  }

  function getScripts(parentElement) {
    return getResources(parentElement, 'script[src]', 'src');
  }

  function getFixedUrl(node, attribute) {
    return '' + new URL(node.getAttribute(attribute), location.href);
  }

  function onLoad() {
    // console.debug('[singular] before load');
    var end = SERIES_CALLBACKS.length;
    var current = -1;
    var series = Promise.resolve();

    var _loop = function _loop() {
      var callback = SERIES_CALLBACKS[current];
      series = series.then(function () {
        return callback();
      });
    };

    while (++current < end) {
      _loop();
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
    // console.debug('[singular] after load');
    document.documentElement.style.visibility = 'inherit';

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
    var changedElement = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.body;
    // console.debug('[singular] Loaded');
    LOADED = true;
    var page = PAGES[CURRENT_PATH];
    var callbacks = [].concat(_toConsumableArray(READY_CALLBACKS.splice(0, READY_CALLBACKS.length)), LOAD_CALLBACKS, _toConsumableArray(page.enterCallbacks));
    var end = callbacks.length;
    var current = -1;

    while (++current < end) {
      callbacks[current](changedElement);
    }
  }
}(window, document);
//# sourceMappingURL=singular.js.map
