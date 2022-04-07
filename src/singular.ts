interface SingularConfigure {
    /**
     * Set Development Mode
     * @description
     *   Does not Reload Page after Occurred Error
     * @default false
     */
    development: boolean;
    /**
     * Changeable Element's ID after Routed
     * @default null
     * @description
     *  - null | 'body': Change all Children of BODY
     *  - 'id': Change Single Element
     *  - ['id1' 'id2']: Change Multiple Elements
     */
    elementIds: undefined | null | string | string[];

    /**
     * Changeable Element Class Attribute after Routed
     * @default null
     * @description
     *   Copy Class Attribute with Ignore outlet Option
     */
    classSelectors: undefined | null | string | string[];

    /**
     * Does not Reload document.documentElement after Re-Routed
     * @default false;
     */
    enableKeepHtml: boolean;

    /**
     * Does not Remove & Reload CSS after Routed
     * @default false;
     */
    enableKeepStyles: boolean;

    /**
     * Does not Ignore Search String when Make Cache
     * @default false
     */
    enableSearchString: boolean;

    /**
     * Does not Ignore Hash String when Make Cache
     * @default false
     */
    enableHashString: boolean;
}

type VoidPromiseCallback = (...args: any) => Promise<void>;
type SingularAnchor = HTMLAnchorElement & { _singularAnchor?: false | HTMLAnchorElement };
type Child<T = HTMLElement> = T & { parentNode: HTMLElement };
type Children<T> = Array<Child<T>>;
type ChangedElementCallback = (changedElement: HTMLElement) => void;

/**
 * @alias singular.enter
 * @returns singular
 */
const singular = (function (window, document, undefined) {
    const {href: START_PATH, origin: ORIGIN} = location;
    const {from: FROM} = Array;

    const READY_CALLBACKS: ChangedElementCallback[] = [];
    const LOAD_CALLBACKS: ChangedElementCallback[] = [];
    const UNLOAD_CALLBACKS: Function[] = [];
    let CONFIGURE: SingularConfigure = {
        development: false,
        elementIds: null,
        classSelectors: null,
        enableKeepHtml: false,
        enableKeepStyles: false,
        enableSearchString: false,
        enableHashString: false
    };

    let START_HTML: null | string = document.documentElement.outerHTML;
    let SERIES_CALLBACKS: VoidPromiseCallback[] = [];
    let PARALLEL_CALLBACKS: VoidPromiseCallback[] = [];
    let RENDERED_STYLES: Record<string, HTMLLinkElement> = {};
    let RENDERED_SCRIPTS: Record<string, HTMLScriptElement> = {};
    let LOADED = false
    let CURRENT_PATH = START_PATH;
    let ABORTER: AbortController;

    class Page {
        url!: string;
        title!: string;
        styles!: string[];
        scripts!: string[];
        enterCallbacks: ChangedElementCallback[] = [];
        exitCallbacks: Function[] = [];
        classes!: null | Record<string, string>;
        html!: string;
    }

    class State {
        singular: {
            href: string
        }

        constructor(href: string) {
            this.singular = {
                href
            };
        }
    }

    const PAGES: Record<string, Page> = {
        [START_PATH]: new Page
    };

    function tag<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] {
        return document.createElement(tagName);
    }

    function byId(id: string) {
        return document.getElementById(id);
    }

    function fragmentHtml(html: string) {
        const fragment = document.createDocumentFragment();
        const fragmentHtml = tag('html');
        fragment.appendChild(fragmentHtml);
        fragmentHtml.innerHTML = html;
        return fragmentHtml;
    }

    /**
     * @alias singular.enter
     * @param callback
     */
    function singular(callback: VoidPromiseCallback) {
        return singular.enter(callback)
    }

    /**
     * Set Configure
     * @param configure
     */
    singular.configure = function (configure: Partial<SingularConfigure>) {
        const {elementIds, classSelectors} = configure;
        if (elementIds) {
            if (typeof elementIds === 'string') {
                configure.elementIds = [elementIds];
            }

            if (elementIds.indexOf('body') > -1) {
                configure.elementIds = null;
            }
        }

        if (classSelectors) {
            if (typeof classSelectors === 'string') {
                configure.classSelectors = [classSelectors];
            }
        }

        CONFIGURE = Object.assign(CONFIGURE, configure);

        return singular;
    }

    /**
     * Set Series Callback for Bootstrap
     * @description
     *   Callbacks Call as Single Thread
     *   If Previous Callback to failed, Does not Move to Next Callback.
     * @param callback
     */
    singular.series = function (callback: VoidPromiseCallback) {
        SERIES_CALLBACKS[SERIES_CALLBACKS.length] = callback;
        return singular;
    }

    /**
     * Set Parallel Callback for Bootstrap
     * @description
     *   Callbacks Call as Multiple Thread
     * @param callback
     */
    singular.parallel = function (callback: VoidPromiseCallback) {
        PARALLEL_CALLBACKS[PARALLEL_CALLBACKS.length] = callback;
        return singular;
    }

    /**
     * Add External Stylesheet to <HEAD> Using <LINK>
     * @param href
     */
    singular.addStyle = function (href: string) {
        const link = tag('link');

        return {
            link,
            promise: new Promise<void>((resolve) => {
                const resolver = () => resolve();
                link.onload = resolver;
                link.onerror = resolver;
                link.rel = 'stylesheet';
                document.head.append(link);

                link.href = href;
            })
        }
    };

    /**
     *  Add External Stylesheet to <HEAD> Using <SCRIPT>
     * @param src
     * @param async
     */
    singular.addScript = function (src: string, async = true) {
        const script = tag('script');

        return {
            script,
            promise: new Promise<void>((resolve) => {
                const resolver = () => resolve();
                script.onload = resolver;
                script.onerror = resolver;
                script.async = async;
                document.head.append(script);

                script.src = src;
            })
        }
    };

    /**
     * Run Once in Declared Document after DOMContentLoaded
     * @param callback
     */
    singular.ready = function (callback: ChangedElementCallback) {
        READY_CALLBACKS[READY_CALLBACKS.length] = callback;

        if (LOADED) {
            callback(document.body);
        }

        return singular;
    }

    /**
     * Run Everytime in Every Document after DOMContentLoaded
     * @param callback
     */
    singular.load = function (callback: ChangedElementCallback) {
        LOAD_CALLBACKS[LOAD_CALLBACKS.length] = callback;

        if (LOADED) {
            callback(document.body);
        }

        return singular;
    }

    singular.unload = function (callback: Function) {
        UNLOAD_CALLBACKS[UNLOAD_CALLBACKS.length] = callback;

        return singular;
    }

    /**
     * Run Everytime in Declared Document after DOMContentLoaded
     * @alias singular
     * @param callback
     */
    singular.enter = function (callback: ChangedElementCallback) {
        const store = PAGES[CURRENT_PATH].enterCallbacks;
        store[store.length] = callback;

        if (LOADED) {
            callback(document.body);
        }

        return singular;
    }

    /**
     * Run Everytime in Declared Document after beforeunload
     * @param callback
     */
    singular.exit = function (callback: Function) {
        const {exitCallbacks} = PAGES[CURRENT_PATH];
        exitCallbacks[exitCallbacks.length] = callback;

        return singular;
    };

    /**
     * Move to Other Document
     * @param requestUrl
     * @param elementIds
     */
    singular.route = function (requestUrl: string, elementIds?: string[]) {
        try {
            route(requestUrl, elementIds);
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
    singular.changed = function (target: HTMLElement = document.body) {
        const end = LOAD_CALLBACKS.length;
        let current = -1;

        while (++current < end) {
            LOAD_CALLBACKS[current](target);
        }

        return singular;
    }

    function route(this: any, requestUrl: string, elementIds?: string[]) {

        const {entries: styleEntries, urls: styleUrls} = getStyles(document.documentElement);
        const {entries: scriptEntries, urls: scriptUrls} = getScripts(document.documentElement);

        let end = styleEntries.length
        let current = -1;
        while (++current > end) {
            const [node, url] = styleEntries[current];
            RENDERED_STYLES[url] = node;
        }

        end = scriptEntries.length
        current = -1;
        while (++current < end) {
            const [node, url] = scriptEntries[current];
            RENDERED_SCRIPTS[url] = node;

            document.head.append(node);
        }

        const page = PAGES[getHref(START_PATH)];
        page.url = START_PATH;
        page.title = document.title;
        page.styles = styleUrls;
        page.scripts = scriptUrls;
        page.html = START_HTML as string;
        START_HTML = null;

        const {links} = document;
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
        return (route = function (requestUrl, elementIds?) {
            // console.debug(`[singular] ${href}`);

            if (LOADED) {
                const callbacks = PAGES[CURRENT_PATH].exitCallbacks.concat(UNLOAD_CALLBACKS);
                const end = callbacks.length;
                let current = -1;

                try {
                    while (++current < end) {
                        callbacks[current]();
                    }
                } catch (reason) {
                    console.warn(reason);
                }
            } else if (ABORTER) {
                ABORTER.abort();
            }

            window.scrollTo(0, 0);
            // document.title = requestUrl.substring(requestUrl.indexOf(':') + 3);

            LOADED = false;
            CURRENT_PATH = getHref(requestUrl);

            const page = PAGES[CURRENT_PATH];

            if (page) {
                if (CONFIGURE.enableKeepHtml) {
                    render(page);
                    pushState(page.url)
                } else {
                    request(requestUrl)
                        .then(([responseUrl, html]) => {
                            page.html = html;
                            render(page);
                        });
                }
            } else {
                request(requestUrl)
                    .then(([responseUrl, html]) => {
                        parse(requestUrl, responseUrl, html, elementIds || CONFIGURE.elementIds);
                    });
            }
        }).apply(this, arguments as any);

        function request(href: string) {
            ABORTER = new AbortController();

            return fetch(href, {
                signal: ABORTER.signal
            })
                .then(responseText)
                .catch(catchError) as Promise<[string, string]>;
        }

        function responseText(response: Response) {
            const {url} = response;
            pushState(url);
            return Promise.all([
                Promise.resolve(url),
                response.text()
            ]);
        }

        function catchError(reason: Error) {
            console.warn(reason);
        }

        function pushState(url: string) {
            history.pushState(new State(url), url, url);
        }
    }

    function parse(requestUrl: string, responseUrl: string, rawHtml: string, elementIds?: string[]) {
        const fragment = fragmentHtml(rawHtml)
        const title = (fragment.getElementsByTagName('TITLE')[0] as HTMLElement || {}).innerText || requestUrl;
        const {classSelectors} = CONFIGURE;

        let current: number;
        let classMap: null | Record<string, string> = null;

        if (classSelectors) {
            classMap = {};
            current = classSelectors.length
            while (current-- > 0) {
                const selector = classSelectors[current];
                classMap[selector] = (fragment.getElementsByTagName(selector)[0] || {}).className || '';
            }
        }

        const {urls: styleUrls} = getStyles(fragment);
        const {entries: scriptEntries, urls: scriptUrls} = getScripts(fragment);

        current = scriptEntries.length;
        while (current-- > 0) {
            const [node] = scriptEntries[current];
            if (node?.parentNode) {
                node.parentNode.removeChild(node);
            }
        }

        let html: string;
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
        } else {
            html = fragment.outerHTML
        }

        const page = new Page;
        page.url = responseUrl;
        page.title = title;
        page.styles = styleUrls;
        page.scripts = scriptUrls;
        page.classes = classMap
        page.html = html

        const url = new URL(CURRENT_PATH);
        if (url.pathname.endsWith('/')) {
            url.pathname = url.pathname.substring(0, url.pathname.length - 1);
        }
        PAGES['' + url] = page;
        render(page);
    }

    function getHref(href: string) {
        const url = new URL(href);

        if (!CONFIGURE.enableHashString) {
            url.hash = '';
        }

        if (!CONFIGURE.enableSearchString) {
            url.search = '';
        }

        let {pathname} = url;
        if (pathname.endsWith('/')) {
            url.pathname = pathname.substring(0, pathname.length - 1);
        }

        return '' + url;
    }

    function render(page: Page) {
        const {url, title, styles, scripts, classes, html} = page;
        const {elementIds, classSelectors} = CONFIGURE;

        document.title = title || url.substring(url.indexOf('://') + 3);

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
        if (elementIds) {
            const replaceMap: [HTMLElement, HTMLElement][] = [];
            let current = elementIds.length;
            while (current-- > 0) {
                const selector = elementIds[current];
                const from = fragment.querySelector('#' + selector) as HTMLElement;
                const to = byId(selector) as HTMLElement;

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
                    (to.parentNode as HTMLElement).replaceChild(from, to);
                }
            }
        } else {
            changeAll = true;
        }

        if (changeAll) {
            document.body.innerHTML = '';
            document.body.append(...(fragment.getElementsByTagName('BODY')[0] || fragment).children);
        }

        fragment.innerHTML = '';

        const {addScript, addStyle} = singular;
        const elements = [];
        const importPromises = [Promise.resolve()];
        const removeStyles: HTMLLinkElement[] = [];
        let end: number;
        let current: number;

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
                delete RENDERED_STYLES[href]
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
            const {link, promise} = addStyle(href);
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
            const {script, promise} = addScript(src);
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
            })
    }

    function getResources<T extends HTMLElement>(parentElement: HTMLElement, selector: string, attributeName: string) {
        const entries: Array<[T, string]> = [];
        const urls: string[] = [];
        const nodes = FROM(parentElement.querySelectorAll(selector)) as Children<T>;
        const end = nodes.length;
        let current = -1;
        while (++current < end) {
            const node = nodes[current];

            if (!node.getAttribute(attributeName) || (node as any)[attributeName].startsWith(ORIGIN)) {
                continue;
            }

            const value = getFixedUrl(node, attributeName)

            entries[entries.length] = [node, value];
            urls[urls.length] = value;

        }
        return {entries, urls};
    }

    function getStyles(parentElement: HTMLElement) {
        return getResources<HTMLLinkElement>(parentElement, 'link[rel=stylesheet]', 'href');
    }

    function getScripts(parentElement: HTMLElement) {
        return getResources<HTMLScriptElement>(parentElement, 'script[src]', 'src');
    }

    function getFixedUrl(node: HTMLElement, attribute: string) {
        return '' + (new URL(node.getAttribute(attribute) as string, location.href));
    }

    function onLoad() {
        // console.debug('[singular] before load');

        const end = SERIES_CALLBACKS.length;
        let current = -1;

        let series = Promise.resolve();
        while (++current < end) {
            const callback = SERIES_CALLBACKS[current];
            series = series.then(() => callback());
        }

        const prepares = [series];
        current = PARALLEL_CALLBACKS.length;
        while (current-- > 0) {
            prepares[prepares.length] = PARALLEL_CALLBACKS[current]();
        }

        SERIES_CALLBACKS = [];
        PARALLEL_CALLBACKS = [];

        Promise.all(prepares)
            .then(onLoading)
            .catch(catchReload);
    }

    function onLoading() {
        // console.debug('[singular] after load');
        document.documentElement.style.visibility = 'inherit';
        try {
            onLoaded();
        } catch (reason) {
            console.warn(reason)
        }
    }

    function catchReload(reason: Error) {
        console.warn(reason);
        if (!CONFIGURE.development) {
            location.reload();
        }
    }

    function onLoaded(changedElement = document.body) {
        // console.debug('[singular] Loaded');
        LOADED = true;

        const page = PAGES[CURRENT_PATH];
        const callbacks = [
            ...READY_CALLBACKS.splice(0, READY_CALLBACKS.length),
            ...LOAD_CALLBACKS,
            ...page.enterCallbacks
        ];

        const end = callbacks.length;
        let current = -1;
        while (++current < end) {
            callbacks[current](changedElement);
        }
    }

    addEventListener(
        'click',
        function onClick(event) {
            let node = event.target as SingularAnchor;

            switch (node.tagName) {
                case 'BODY':
                    return false;
                case 'A':
                    break;
                default:
                    if (node._singularAnchor === false) {
                        return true;
                    }

                    const anchor = node.closest('a') as SingularAnchor;
                    if (!anchor || !anchor.href) {
                        node._singularAnchor = false;
                        return true;
                    }
                    node = anchor;
            }

            const {href} = node;
            const rawHref = node.getAttribute('href');

            if (!href.startsWith(ORIGIN)
                || node.download
                || (rawHref && rawHref.startsWith('#'))
            ) {
                node._singularAnchor = false;
                return true;
            }

            node._singularAnchor = node;

            event.stopPropagation();
            event.preventDefault();

            const inlineOutlet = node.dataset?.outlet;
            singular.route(href, inlineOutlet ? inlineOutlet.split(',') : undefined);

            return false;
        }
    );

    addEventListener(
        'popstate',
        function onPopstate(event) {
            const {state} = event;

            if (state && state.singular) {
                route(state.singular.href);
            }

            return true;
        }
    );

    addEventListener(
        'DOMContentLoaded',
        function onDOMContentLoaded() {
            CURRENT_PATH = getHref(START_PATH);

            if (START_PATH !== CURRENT_PATH) {
                PAGES[CURRENT_PATH] = PAGES[START_PATH];
                delete PAGES[START_PATH];
            }

            document.documentElement.style.visibility = 'hidden';

            onLoad();
        }
    );

    return singular;
})(window, document);