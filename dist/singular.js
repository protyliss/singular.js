"use strict";
const singular = (function singularInit(window, document, undefined) {
    const { href: START_URL, origin: ORIGIN } = location;
    const { from: FROM } = Array;
    let CONFIGURE = {
        development: false,
        outletSelectors: null,
        classSelectors: null,
        enableKeepHtml: false,
        enableKeepStyles: false,
        enableSearchString: false,
        enableHashString: false,
        disableTitleChange: false
    };
    let RENDERED_STYLES = {};
    let RENDERED_SCRIPTS = {};
    let LOADED = false;
    let CURRENT_URL = START_URL;
    let CURRENT_SCRIPT_URL = START_URL;
    let ABORTER;
    class Page {
        url;
        title;
        styles;
        scripts;
        classes;
        html;
    }
    class Lifecycle {
        static seriesCallbacks = [];
        static parallelCallbacks = [];
        static readyCallbacks = [];
        static loadCallbacks = [];
        static unloadCallbacks = [];
        enterCallbacks = [];
        exitCallbacks = [];
    }
    class State {
        singular;
        constructor(href) {
            this.singular = {
                href
            };
        }
    }
    const PAGES = {
        [START_URL]: new Page
    };
    const LIFECYCLES = {
        [START_URL]: new Lifecycle
    };
    addEventListener('click', function singularOnClick(event) {
        let node = event.target;
        switch (node.tagName) {
            case 'BODY':
                return false;
            case 'A':
                break;
            default:
                if (node._singularAnchor === false) {
                    return true;
                }
                const anchor = node.closest('a');
                if (!anchor || !anchor.href) {
                    node._singularAnchor = false;
                    return true;
                }
                node = anchor;
        }
        const { href } = node;
        const rawHref = node.getAttribute('href');
        if (node.target
            || node.download
            || !href.startsWith(ORIGIN)
            || (rawHref && rawHref.startsWith('#'))) {
            node._singularAnchor = false;
            return true;
        }
        node._singularAnchor = node;
        event.stopPropagation();
        event.preventDefault();
        const inlineOutlet = node.dataset?.outlet;
        singular.route(href, inlineOutlet ? inlineOutlet.split(',') : undefined);
        return false;
    });
    addEventListener('popstate', function singularOnPopstate(event) {
        const { state } = event;
        if (state && state.singular) {
            route(state.singular.href, undefined, false);
        }
        return true;
    });
    addEventListener('DOMContentLoaded', function singularOnDOMContentLoaded() {
        PAGES[CURRENT_URL].html = document.documentElement.outerHTML;
        CURRENT_URL = getHref(START_URL);
        CURRENT_SCRIPT_URL = getScriptUrl(START_URL);
        if (START_URL !== CURRENT_URL) {
            PAGES[CURRENT_URL] = PAGES[START_URL];
            delete PAGES[START_URL];
        }
        if (START_URL !== CURRENT_SCRIPT_URL) {
            LIFECYCLES[CURRENT_SCRIPT_URL] = LIFECYCLES[START_URL];
            delete LIFECYCLES[START_URL];
        }
        document.documentElement.style.visibility = 'hidden';
        onLoad();
    });
    return class Singular {
        /**
         * Set Configure
         * @param configure
         */
        static configure(configure) {
            const { outletSelectors, classSelectors } = configure;
            if (outletSelectors) {
                if (typeof outletSelectors === 'string') {
                    configure.outletSelectors = [outletSelectors];
                }
                if (outletSelectors.indexOf('body') > -1) {
                    configure.outletSelectors = ['body'];
                }
            }
            if (classSelectors) {
                if (typeof classSelectors === 'string') {
                    configure.classSelectors = [classSelectors];
                }
            }
            CONFIGURE = Object.assign(CONFIGURE, configure);
            return this;
        }
        /**
         * Add External Stylesheet to <HEAD> Using <LINK>
         * @param href
         */
        static addStyle(href) {
            const link = tag('link');
            return {
                link,
                promise: new Promise((resolve) => {
                    const resolver = () => resolve();
                    link.onload = resolver;
                    link.onerror = resolver;
                    link.rel = 'stylesheet';
                    document.head.append(link);
                    link.href = href;
                })
            };
        }
        ;
        /**
         *  Add External Stylesheet to <HEAD> Using <SCRIPT>
         * @param src
         * @param async
         */
        static addScript(src, async = true) {
            const script = tag('script');
            return {
                script,
                promise: new Promise((resolve) => {
                    const resolver = () => resolve();
                    script.onload = resolver;
                    script.onerror = resolver;
                    script.async = async;
                    document.head.append(script);
                    script.src = src;
                })
            };
        }
        ;
        /**
         * Set Parallel Callback for Bootstrap
         * @description
         *   Callbacks Call as Multiple Thread
         * @param callback
         */
        static parallel(callback) {
            Lifecycle.parallelCallbacks[Lifecycle.parallelCallbacks.length] = callback;
            return this;
        }
        /**
         * Set Series Callback for Bootstrap
         * @description
         *   Callbacks Call as Single Thread
         *   If Previous Callback to failed, Does not Move to Next Callback.
         * @param callback
         */
        static series(callback) {
            Lifecycle.seriesCallbacks[Lifecycle.seriesCallbacks.length] = callback;
            return this;
        }
        /**
         * Run Once in Declared Document after DOMContentLoaded
         * @param callback
         */
        static ready(callback) {
            Lifecycle.readyCallbacks[Lifecycle.readyCallbacks.length] = callback;
            if (LOADED) {
                callback(document.body);
            }
            return this;
        }
        /**
         * Run Everytime in Every Document after DOMContentLoaded
         * @param callback
         */
        static load(callback) {
            Lifecycle.loadCallbacks[Lifecycle.loadCallbacks.length] = callback;
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
        static enter(callback) {
            const { enterCallbacks } = LIFECYCLES[CURRENT_SCRIPT_URL];
            enterCallbacks[enterCallbacks.length] = callback;
            if (LOADED) {
                callback(document.body);
            }
            return this;
        }
        /**
         * Run Everytime in Declared Document after beforeunload
         * @param callback
         */
        static exit(callback) {
            const { exitCallbacks } = LIFECYCLES[CURRENT_SCRIPT_URL];
            exitCallbacks[exitCallbacks.length] = callback;
            return this;
        }
        ;
        static unload(callback) {
            Lifecycle.unloadCallbacks[Lifecycle.unloadCallbacks.length] = callback;
            return this;
        }
        /**
         * Move to Other Document
         * @param requestUrl
         * @param outletSelectors
         */
        static route(requestUrl, outletSelectors) {
            try {
                route(requestUrl, outletSelectors);
            }
            catch (reason) {
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
        static changed(target = document.body) {
            const end = Lifecycle.loadCallbacks.length;
            let current = -1;
            while (++current < end) {
                Lifecycle.loadCallbacks[current](target);
            }
            return this;
        }
    };
    function tag(tagName) {
        return document.createElement(tagName);
    }
    function byId(id) {
        return document.getElementById(id);
    }
    function fragmentHtml(html) {
        const fragment = document.createDocumentFragment();
        const fragmentHtml = tag('html');
        fragment.appendChild(fragmentHtml);
        fragmentHtml.innerHTML = html;
        return fragmentHtml;
    }
    function route(requestUrl, outletSelectors = undefined, push = true) {
        const { entries: styleEntries, urls: styleUrls } = getStyles(document.documentElement);
        const { entries: scriptEntries, urls: scriptUrls } = getScripts(document.documentElement);
        let end = styleEntries.length;
        let current = -1;
        while (++current > end) {
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
        const { links } = document;
        current = links.length;
        while (current-- > 0) {
            const anchor = links[current];
            const href = anchor.getAttribute('href');
            if (!href || !(href.startsWith('./') || href.startsWith('../'))) {
                continue;
            }
            anchor.setAttribute('href', anchor.href);
        }
        // @ts-ignore
        return (route = routeAfterFirstRouted).apply(this, arguments);
        function routeAfterFirstRouted(requestUrl, outletSelectors = undefined, push = true) {
            // console.debug(`[singular] ${href}`);
            if (LOADED) {
                const lifecycle = LIFECYCLES[CURRENT_SCRIPT_URL];
                const callbacks = lifecycle.exitCallbacks.concat(Lifecycle.unloadCallbacks);
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
            else if (ABORTER) {
                ABORTER.abort();
            }
            window.scrollTo(0, 0);
            // document.title = requestUrl.substring(requestUrl.indexOf(':') + 3);
            LOADED = false;
            CURRENT_URL = getHref(requestUrl);
            CURRENT_SCRIPT_URL = getScriptUrl(requestUrl);
            const page = PAGES[CURRENT_URL];
            if (page) {
                if (CONFIGURE.enableKeepHtml) {
                    push && pushState(getFixedUrl(page.url, requestUrl));
                    render(page);
                }
                // noinspection JSUnusedLocalSymbols
                return request(requestUrl)
                    .then(([responseUrl, html]) => {
                    page.html = html;
                    push && pushState(responseUrl);
                    render(page);
                });
            }
            return request(requestUrl)
                .then(([responseUrl, html]) => {
                push && pushState(responseUrl);
                parse(requestUrl, responseUrl, html, outletSelectors || CONFIGURE.outletSelectors);
            });
        }
        function request(href) {
            ABORTER = new AbortController();
            return fetch(href, {
                signal: ABORTER.signal
            })
                .then(responseText)
                .catch(catchError);
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
        function getFixedUrl(responseUrl, requestUrl) {
            const parsedResponseUrl = new URL(responseUrl);
            const parsedRequestUrl = new URL(requestUrl);
            parsedResponseUrl.search = parsedRequestUrl.search;
            parsedResponseUrl.hash = parsedRequestUrl.hash;
            return '' + parsedRequestUrl;
        }
    }
    function parse(requestUrl, responseUrl, rawHtml, elementIds) {
        const fragment = fragmentHtml(rawHtml);
        const title = (fragment.getElementsByTagName('TITLE')[0] || {}).innerText || requestUrl;
        const { classSelectors } = CONFIGURE;
        let current;
        let classMap = null;
        if (classSelectors) {
            classMap = {};
            current = classSelectors.length;
            while (current-- > 0) {
                const selector = classSelectors[current];
                classMap[selector] = (fragment.getElementsByTagName(selector)[0] || {}).className || '';
            }
        }
        const { urls: styleUrls } = getStyles(fragment);
        const { entries: scriptEntries, urls: scriptUrls } = getScripts(fragment);
        current = scriptEntries.length;
        while (current-- > 0) {
            const [node] = scriptEntries[current];
            if (node?.parentNode) {
                node.parentNode.removeChild(node);
            }
        }
        let html;
        if (elementIds) {
            const targetHTML = [];
            let current = elementIds.length;
            while (current-- > 0) {
                const target = fragment.querySelector('#' + elementIds[current]);
                if (target) {
                    targetHTML[targetHTML.length] = target.outerHTML;
                }
            }
            html = targetHTML.join('');
        }
        else {
            html = fragment.outerHTML;
        }
        const page = new Page;
        page.url = responseUrl;
        page.title = title;
        page.styles = styleUrls;
        page.scripts = scriptUrls;
        page.classes = classMap;
        page.html = html;
        const url = new URL(CURRENT_URL);
        if (url.pathname.endsWith('/')) {
            url.pathname = url.pathname.substring(0, url.pathname.length - 1);
        }
        PAGES['' + url] = page;
        const scriptUrl = getScriptUrl('' + url);
        if (!LIFECYCLES[scriptUrl]) {
            LIFECYCLES[scriptUrl] = new Lifecycle();
        }
        render(page);
    }
    function getHref(href) {
        const url = new URL(href);
        if (!CONFIGURE.enableHashString) {
            url.hash = '';
        }
        if (!CONFIGURE.enableSearchString) {
            url.search = '';
        }
        let { pathname } = url;
        if (pathname.endsWith('/')) {
            url.pathname = pathname.substring(0, pathname.length - 1);
        }
        return '' + url;
    }
    function getScriptUrl(href) {
        const url = new URL(href);
        url.hash = '';
        url.search = '';
        let { pathname } = url;
        if (pathname.endsWith('/')) {
            url.pathname = pathname.substring(0, pathname.length - 1);
        }
        return '' + url;
    }
    function render(page) {
        const { url, title, styles, scripts, classes, html } = page;
        const { outletSelectors, classSelectors } = CONFIGURE;
        if (!CONFIGURE.disableTitleChange) {
            document.title = title || url.substring(url.indexOf('://') + 3);
        }
        if (classSelectors && classes) {
            let current = classSelectors.length;
            while (current-- > 0) {
                const selector = classSelectors[current];
                const target = document.documentElement.querySelector(selector);
                if (target) {
                    target.className = classes[selector];
                }
            }
        }
        const fragment = fragmentHtml(html);
        let changeAll = false;
        if (outletSelectors) {
            const replaceMap = [];
            let current = outletSelectors.length;
            while (current-- > 0) {
                const selector = outletSelectors[current];
                const from = fragment.querySelector(selector);
                const to = document.querySelector(selector);
                if (!from || !to) {
                    changeAll = true;
                    break;
                }
                replaceMap[replaceMap.length] = [from, to];
            }
            if (!changeAll) {
                current = replaceMap.length;
                while (current-- > 0) {
                    const [from, to] = replaceMap[current];
                    to.parentNode.replaceChild(from, to);
                }
            }
        }
        else {
            changeAll = true;
        }
        if (changeAll) {
            document.body.innerHTML = (fragment.getElementsByTagName('BODY')[0] || fragment).innerHTML;
            document.body.append(...(fragment.getElementsByTagName('BODY')[0] || fragment).children);
        }
        fragment.innerHTML = '';
        const { addScript, addStyle } = singular;
        const elements = [];
        const importPromises = [Promise.resolve()];
        const removeStyles = [];
        let end;
        let current;
        if (!CONFIGURE.enableKeepStyles) {
            const renderedStyleHrefs = Object.keys(RENDERED_STYLES);
            current = renderedStyleHrefs.length;
            while (current-- > 0) {
                let href = renderedStyleHrefs[current];
                if (styles.indexOf(href) > -1) {
                    continue;
                }
                // RENDERED_STYLES[href].disabled = true;
                removeStyles[removeStyles.length] = RENDERED_STYLES[href];
                delete RENDERED_STYLES[href];
            }
        }
        // add external stylesheet
        end = styles.length;
        current = -1;
        while (++current < end) {
            const href = styles[current];
            if (RENDERED_STYLES[href]) {
                //     RENDERED_STYLES[href].disabled = false;
                continue;
            }
            const { link, promise } = addStyle(href);
            RENDERED_STYLES[href] = link;
            importPromises[importPromises.length] = promise;
            elements[elements.length] = link;
        }
        // add external script
        end = scripts.length;
        current = -1;
        while (++current < end) {
            const src = scripts[current];
            if (RENDERED_SCRIPTS[src]?.parentNode) {
                // console.log(RENDERED_SCRIPTS[src], RENDERED_SCRIPTS[src].parentNode);
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
        Promise.all(importPromises)
            .then(() => {
            let current = removeStyles.length;
            while (current-- > 0) {
                const link = removeStyles[current];
                if (link && link.parentNode) {
                    link.parentNode.removeChild(link);
                }
            }
            onLoad();
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
        return getResources(parentElement, 'link[rel=stylesheet]', 'href');
    }
    function getScripts(parentElement) {
        return getResources(parentElement, 'script[src]', 'src');
    }
    function getFixedUrl(node, attribute) {
        return '' + (new URL(node.getAttribute(attribute), location.href));
    }
    function onLoad() {
        // console.debug('[singular] before load');
        const end = Lifecycle.seriesCallbacks.length;
        let current = -1;
        let series = Promise.resolve();
        while (++current < end) {
            const callback = Lifecycle.seriesCallbacks[current];
            series = series.then(() => callback());
        }
        const prepares = [series];
        current = Lifecycle.parallelCallbacks.length;
        while (current-- > 0) {
            prepares[prepares.length] = Lifecycle.parallelCallbacks[current]();
        }
        Lifecycle.seriesCallbacks = [];
        Lifecycle.parallelCallbacks = [];
        Promise.all(prepares)
            .then(onLoading)
            .catch(catchReload);
    }
    function onLoading() {
        // console.debug('[singular] after load');
        document.documentElement.style.visibility = 'inherit';
        try {
            onLoaded();
        }
        catch (reason) {
            console.warn(reason);
        }
    }
    function catchReload(reason) {
        console.warn(reason);
        if (!CONFIGURE.development) {
            location.reload();
        }
    }
    function onLoaded(changedElement = document.body) {
        // console.debug('[singular] Loaded');
        LOADED = true;
        const lifecycle = LIFECYCLES[CURRENT_SCRIPT_URL];
        const callbacks = [
            ...Lifecycle.readyCallbacks.splice(0, Lifecycle.readyCallbacks.length),
            ...Lifecycle.loadCallbacks,
            ...lifecycle.enterCallbacks
        ];
        const end = callbacks.length;
        let current = -1;
        while (++current < end) {
            callbacks[current](changedElement);
        }
    }
})(window, document);

//# sourceMappingURL=singular.js.map
