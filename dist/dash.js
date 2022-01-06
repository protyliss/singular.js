/**
	dash.js
	the tiny framework for un-complex structure.
	@version 2.3.4
 */
var dash = (function () {
    'use strict';

    let HTML;
    let HEAD;
    let BODY;
    let START_HTML;
    const { href: START_PATH, origin: ORIGIN } = location;
    const { from: FROM } = Array;
    const resolveFactory = () => Promise.resolve();
    const DOM = {
        [START_PATH]: {
            enterCallbacks: [],
            exitCallbacks: []
        }
    };
    const READY_CALLBACKS = [];
    const LOAD_CALLBACKS = [];
    const UNLOAD_CALLBACKS = [];
    const LOAD_SERIES = [resolveFactory];
    const LOAD_PARALLEL = [resolveFactory];
    const CONFIGURE = {
        development: false,
        htmlSelectors: null,
        classSelectors: null,
        enableKeepStyles: false,
        enableSearchString: false,
        enableHashString: false
    };
    let RENDERED_STYLES = {};
    let RENDERED_SCRIPTS = {};
    let LOADED = false;
    let CURRENT_PATH = START_PATH;
    const FRAGMENT_HTML = (() => {
        const fragment = document.createDocumentFragment();
        const fragmentHtml = document.createElement('html');
        fragment.appendChild(fragmentHtml);
        return fragmentHtml;
    })();
    let FETCH_CONTROLLER;
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
        const keys = Object.keys(configure);
        let current = keys.length;
        while (current-- > 0) {
            const key = keys[current];
            CONFIGURE[key] = configure[key];
        }
        return dash;
    };
    /**
     * Set Series Callback Before Initialize to Load
     * @description
     *   Callbacks Call as Single Thread
     *   If Previous Callback to failed, Does not Move to Next Callback.
     * @param callback
     */
    dash.require = function (callback) {
        LOAD_SERIES[LOAD_SERIES.length] = callback;
        return dash;
    };
    /**
     * Set Parallel Callback Before Initialize to Load
     * @description
     *   Callbacks Call as Multiple Thread
     * @param callback
     */
    dash.asyncRequire = function (callback) {
        LOAD_PARALLEL[LOAD_PARALLEL.length] = callback;
        return dash;
    };
    /**
     * Add External Stylesheet to <HEAD> Using <LINK>
     * @param href
     */
    dash.addStyle = function (href) {
        const link = document.createElement('link');
        return {
            link,
            promise: new Promise((resolve) => {
                const resolver = () => resolve();
                link.onload = resolver;
                link.onerror = resolver;
                link.rel = 'stylesheet';
                HEAD.append(link);
                link.href = href;
            })
        };
    };
    /**
     * Add External Stylesheet to <HEAD> Using <SCRIPT>
     * @param href
     */
    dash.addScript = function (src, async = true) {
        const script = document.createElement('script');
        return {
            script,
            promise: new Promise((resolve) => {
                const resolver = () => resolve();
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
        const store = DOM[CURRENT_PATH].enterCallbacks;
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
        const store = DOM[CURRENT_PATH].exitCallbacks;
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
        }
        catch (reason) {
            console.warn(reason);
            if (!CONFIGURE.development) {
                location.replace(href);
            }
            return null;
        }
        history.pushState({
            dash: { href }
        }, href, href);
    };
    /**
     * Signal for DOM Changed by any codes
     * @param target
     */
    dash.changed = function (target = BODY) {
        const end = READY_CALLBACKS.length;
        let current = -1;
        while (++current < end) {
            READY_CALLBACKS[current](target);
        }
        return dash;
    };
    function route(href, htmlSelectors) {
        let dom = getDOMBase(START_HTML, href, CONFIGURE.htmlSelectors);
        START_HTML = null;
        const startDom = DOM[CURRENT_PATH];
        startDom.title = document.title;
        startDom.styles = dom.styles;
        startDom.scripts = dom.scripts;
        startDom.html = dom.html;
        RENDERED_STYLES = getStyleElement(HTML).reduce((map, link) => {
            map[link.href] = link;
            return map;
        }, {});
        RENDERED_SCRIPTS = getScriptElement(HTML).reduce((map, script) => {
            map[script.src] = script;
            return map;
        }, {});
        FROM(document.links).forEach(anchor => {
            const href = anchor.getAttribute('href');
            if (!href || !(href.startsWith('./') || href.startsWith('../'))) {
                return null;
            }
            anchor.setAttribute('href', anchor.href);
        });
        // @ts-ignore
        return (route = function (href, htmlSelectors) {
            // console.debug(`[dash] ${href}`);
            if (LOADED) {
                const callbacks = DOM[CURRENT_PATH].exitCallbacks.concat(UNLOAD_CALLBACKS);
                const end = callbacks.length;
                let current = -1;
                try {
                    while (++current < end) {
                        callbacks[current]();
                    }
                }
                catch (reason) {
                    console.warn(reason);
                }
            }
            else if (FETCH_CONTROLLER) {
                FETCH_CONTROLLER.abort();
            }
            if (!htmlSelectors) {
                htmlSelectors = CONFIGURE.htmlSelectors;
            }
            LOADED = false;
            CURRENT_PATH = getDOMHref(href);
            window.scrollTo(0, 0);
            document.title = href.substring(href.indexOf(':') + 3);
            const cache = DOM[CURRENT_PATH];
            if (cache) {
                // console.debug(cache);
                render(cache);
            }
            else {
                FETCH_CONTROLLER = new AbortController();
                fetch(href, {
                    signal: FETCH_CONTROLLER.signal
                })
                    .then(responseText)
                    .then(html => {
                    parse(href, html, htmlSelectors);
                })
                    .catch(reason => {
                    if (!(reason instanceof DOMException)) {
                        console.warn(reason);
                    }
                });
            }
        }).apply(this, arguments);
        function responseText(response) {
            return response.text();
        }
    }
    function parse(href, rawHtml, htmlSelectors) {
        const dom = {
            ...getDOMBase(rawHtml, href, htmlSelectors),
            enterCallbacks: [],
            exitCallbacks: []
        };
        DOM[CURRENT_PATH] = dom;
        render(dom);
    }
    function getDOMHref(href) {
        if (!CONFIGURE.enableHashString) {
            const index = href.indexOf('#');
            if (index > -1) {
                href = href.substring(0, index);
            }
        }
        if (!CONFIGURE.enableSearchString) {
            const searchIndex = href.indexOf('?');
            const hashIndex = href.indexOf('#');
            if (searchIndex > -1) {
                href = (href.substring(0, searchIndex)
                    + (hashIndex > -1 ?
                        href.substring(hashIndex) :
                        ''));
            }
        }
        return href;
    }
    function getDOMBase(rawHtml, href, htmlSelectors) {
        FRAGMENT_HTML.innerHTML = rawHtml;
        const title = (FRAGMENT_HTML.getElementsByTagName('TITLE')[0] || {}).innerText || href;
        let current;
        const { classSelectors } = CONFIGURE;
        let classMap = null;
        if (classSelectors) {
            classMap = {};
            current = classSelectors.length;
            while (current-- > 0) {
                const selector = classSelectors[current];
                classMap[selector] = (FRAGMENT_HTML.getElementsByTagName(selector)[0] || {}).className || '';
            }
        }
        const styleElements = getStyleElement(FRAGMENT_HTML);
        const scriptElements = getScriptElement(FRAGMENT_HTML);
        const styles = getStyleHref(styleElements);
        const scripts = getScriptSrc(scriptElements);
        current = scriptElements.length;
        while (current-- > 0) {
            removeChild(scriptElements[current]);
        }
        let html;
        if (htmlSelectors) {
            const targetHTML = [];
            let current = htmlSelectors.length;
            while (current-- > 0) {
                const target = FRAGMENT_HTML.querySelector('#' + htmlSelectors[current]);
                if (target) {
                    targetHTML[targetHTML.length] = target.outerHTML;
                }
            }
            html = targetHTML.join('');
        }
        else {
            html = FRAGMENT_HTML.outerHTML;
        }
        return {
            fragmentHtml: FRAGMENT_HTML,
            title,
            styles,
            scripts,
            classMap,
            html
        };
    }
    function render(dom) {
        const { title, styles, scripts, classMap, html } = dom;
        if (title) {
            document.title = title;
        }
        const { htmlSelectors, classSelectors } = CONFIGURE;
        if (classSelectors && classMap) {
            let current = classSelectors.length;
            while (current-- > 0) {
                const selector = classSelectors[current];
                const target = HTML.querySelector(selector);
                if (target) {
                    target.className = classMap[selector];
                }
            }
        }
        FRAGMENT_HTML.innerHTML = html;
        if (htmlSelectors) {
            let current = htmlSelectors.length;
            while (current-- > 0) {
                const selector = htmlSelectors[current];
                const from = FRAGMENT_HTML.querySelector('#' + selector);
                const to = BODY.querySelector('#' + selector);
                if (from && to) {
                    const parent = to.parentNode;
                    parent.replaceChild(from, to);
                }
            }
        }
        else {
            BODY.innerHTML = '';
            BODY.append(...(FRAGMENT_HTML.getElementsByTagName('BODY')[0]
                || FRAGMENT_HTML).children);
        }
        const { addScript, addStyle } = dash;
        const elements = [];
        const onLoads = [Promise.resolve()];
        let end;
        let current;
        //if (!CONFIGURE.enableKeepStyles) {
        const renderedStyleHrefs = Object.keys(RENDERED_STYLES);
        current = renderedStyleHrefs.length;
        while (current-- > 0) {
            let href = renderedStyleHrefs[current];
            if (styles.indexOf(href) > -1) {
                continue;
            }
            RENDERED_STYLES[href].disabled = true;
            // removeStyles[removeStyles.length] = RENDERED_STYLES[href] as Child<HTMLLinkElement>;
            // delete RENDERED_STYLES[href];
        }
        //}
        // add external stylesheet
        end = styles.length;
        current = -1;
        while (++current < end) {
            const href = styles[current];
            if (RENDERED_STYLES[href]) {
                RENDERED_STYLES[href].disabled = false;
                continue;
            }
            const { link, promise } = addStyle(href);
            RENDERED_STYLES[href] = link;
            onLoads[onLoads.length] = promise;
            elements[elements.length] = link;
        }
        // add external script
        end = scripts.length;
        current = -1;
        while (++current < end) {
            const src = scripts[current];
            if (RENDERED_SCRIPTS[src]) {
                continue;
            }
            const { script, promise } = addScript(src);
            RENDERED_SCRIPTS[src] = script;
            onLoads[onLoads.length] = promise;
            elements[elements.length] = script;
        }
        if (elements.length) {
            HEAD.append(...elements);
        }
        Promise.all(onLoads)
            .then(() => {
            // let current = removeStyles.length;
            // while (current-- > 0) {
            //     removeChild(removeStyles[current]);
            // }
            onLoad();
        });
    }
    function getStyleElement(container) {
        return FROM(container.querySelectorAll('link[rel=stylesheet]'))
            .filter(styleFilterFunction);
    }
    function styleFilterFunction(link) {
        return !!(link.getAttribute('href') && link.href.startsWith(ORIGIN));
    }
    function getStyleHref(styles) {
        return styles.map(linkHrefMapFunction);
    }
    function linkHrefMapFunction(link) {
        return getAbsoluteUrl(link, 'href');
    }
    function getScriptElement(container) {
        return FROM(container.querySelectorAll('script[src]'))
            .filter(scriptFilterFunction);
    }
    function getScriptSrc(scripts) {
        return scripts.map(scriptSrcMapFunction);
    }
    function scriptFilterFunction(script) {
        return script.getAttribute('src') && script.src.startsWith(ORIGIN);
    }
    function scriptSrcMapFunction(script) {
        return getAbsoluteUrl(script, 'src');
    }
    function getAbsoluteUrl(node, attribute) {
        return '' + (new URL(node.getAttribute(attribute), CURRENT_PATH));
    }
    function removeChild(node) {
        if (node?.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function onLoad() {
        // console.debug('[dash] before load');
        Promise.all([
            LOAD_SERIES.splice(1).reduce(seriesReduceFunction, Promise.resolve()),
            LOAD_PARALLEL.splice(1).map(promiseMapFunction)
        ])
            .then(() => {
            // console.debug('[dash] after load');
            try {
                onLoaded();
            }
            catch (reason) {
                console.warn(reason);
            }
        })
            .catch(reason => {
            console.warn(reason);
            if (!CONFIGURE.development) {
                location.reload();
            }
        });
    }
    function onLoaded(changedElement = BODY) {
        // console.debug('[dash] Loaded');
        LOADED = true;
        const store = DOM[CURRENT_PATH];
        const callbacks = READY_CALLBACKS.concat(LOAD_CALLBACKS, store.enterCallbacks);
        const end = callbacks.length;
        let current = -1;
        while (++current < end) {
            callbacks[current](changedElement);
        }
    }
    function seriesReduceFunction(promise, callback) {
        return promise.then(() => {
            return callback();
        });
    }
    function promiseMapFunction(callback) {
        return callback();
    }
    function bodyOnClick(event) {
        let node = event.target;
        const { tagName } = node;
        if (tagName === 'BODY') {
            return false;
        }
        if (tagName !== 'A') {
            if (node?._dashAnchor === false) {
                return true;
            }
            const anchor = node.closest('a');
            if (!anchor || !anchor.href) {
                node._dashAnchor = false;
                return true;
            }
            node = anchor;
        }
        const { href } = node;
        const rawHref = node.getAttribute('href');
        if (!href.startsWith(ORIGIN)
            || node.download
            || (rawHref && rawHref.startsWith('#'))) {
            node._dashAnchor = false;
            return true;
        }
        node._dashAnchor = node;
        const inlineOutlet = node?.dataset?.outlet;
        dash.route(node.href, inlineOutlet ?
            inlineOutlet.split(',') :
            undefined);
        return stop(event);
    }
    function onPopstate(event) {
        const state = event.state;
        if (state && state.dash) {
            route(state.dash.href);
        }
        return true;
    }
    function stop(event) {
        event.stopPropagation();
        event.preventDefault();
        return false;
    }
    function initialize() {
        HTML = document.documentElement;
        HEAD = document.head;
        BODY = document.body;
        START_HTML = HTML.outerHTML;
        CURRENT_PATH = getDOMHref(START_PATH);
        if (CURRENT_PATH !== START_PATH) {
            DOM[CURRENT_PATH] = { ...DOM[START_PATH] };
            delete DOM[START_PATH];
        }
        onLoad();
    }
    addEventListener('DOMContentLoaded', initialize);
    addEventListener('popstate', onPopstate);
    addEventListener('click', bodyOnClick);

    return dash;

}());
