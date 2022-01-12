interface DashConfigure {
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
    htmlSelectors: undefined | null | string | string[];

    /**
     * Changeable Element Class Attribute after Routed
     * @default null
     * @description
     *   Copy Class Attribute with Ignore outlet Option
     */
    classSelectors: undefined | null | string | string[];

    /**
     * Does not Reload HTML after Re-Routed
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
type DashAnchor = HTMLAnchorElement & { _dashAnchor?: false | HTMLAnchorElement };
type Child<T = HTMLElement> = T & { parentNode: HTMLElement };
type Children<T> = Array<Child<T>>;
type ChangedElementCallback = (changedElement: HTMLElement) => void;

const dash = (function (window, document, undefined) {
    const {href: START_PATH, origin: ORIGIN} = location;
    const {from: FROM} = Array;

    const READY_CALLBACKS: ChangedElementCallback[] = [];
    const LOAD_CALLBACKS: ChangedElementCallback[] = [];
    const UNLOAD_CALLBACKS: Function[] = [];
    const CONFIGURE: DashConfigure = {
        development: false,
        htmlSelectors: null,
        classSelectors: null,
        enableKeepHtml: false,
        enableKeepStyles: false,
        enableSearchString: false,
        enableHashString: false
    }
    const FRAGMENT_HTML = (() => {
        const fragment = document.createDocumentFragment();
        const fragmentHtml = document.createElement('html');
        fragment.appendChild(fragmentHtml);

        return fragmentHtml;
    })();

    let HTML: HTMLElement;
    let HEAD: HTMLHeadElement;
    let BODY: HTMLElement;
    let START_HTML: string;
    let SERIES_CALLBACKS: VoidPromiseCallback[] = [];
    let PARALLEL_CALLBACKS: VoidPromiseCallback[] = [];
    let RENDERED_STYLES: Record<string, HTMLLinkElement> = {};
    let RENDERED_SCRIPTS: Record<string, HTMLScriptElement> = {};
    let LOADED = false
    let CURRENT_PATH = START_PATH;
    let FETCH_CONTROLLER: AbortController;

    class Page {
        title!: string;
        styles!: string[];
        scripts!: string[];
        enterCallbacks: ChangedElementCallback[] = [];
        exitCallbacks: Function[] = [];

        classes!: null | Record<string, string>;

        html!: string;
    }

    class State {
        dash: {
            href: string
        }

        constructor(href: string) {
            this.dash = {
                href
            };
        }
    }

    const PAGES: Record<string, Page> = {
        [START_PATH]: new Page
    };

    /**
     * @alias dash.enter
     * @param callback
     */
    function dash(callback: VoidPromiseCallback) {
        return dash.enter(callback)
    }

    /**
     * Set Configure
     * @param configure
     */
    dash.configure = function <T extends Partial<DashConfigure>>(configure: T) {
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

        const keys = Object.keys(configure) as Array<keyof T>;
        let current = keys.length;
        while (current-- > 0) {
            const key = keys[current];
            (CONFIGURE as T)[key] = configure[key];
        }

        return dash;
    }

    /**
     * Set Series Callback for Bootstrap
     * @description
     *   Callbacks Call as Single Thread
     *   If Previous Callback to failed, Does not Move to Next Callback.
     * @param callback
     */
    dash.series = function (callback: VoidPromiseCallback) {
        SERIES_CALLBACKS[SERIES_CALLBACKS.length] = callback;
        return dash;
    }

    /**
     * Set Parallel Callback for Bootstrap
     * @description
     *   Callbacks Call as Multiple Thread
     * @param callback
     */
    dash.parallel = function (callback: VoidPromiseCallback) {
        PARALLEL_CALLBACKS[PARALLEL_CALLBACKS.length] = callback;
        return dash;
    }

    /**
     * Add External Stylesheet to <HEAD> Using <LINK>
     * @param href
     */
    dash.addStyle = function (href: string) {
        const link = document.createElement('link');

        return {
            link,
            promise: new Promise<void>((resolve) => {
                const resolver = () => resolve();
                link.onload = resolver;
                link.onerror = resolver;
                link.rel = 'stylesheet';
                HEAD.append(link);

                link.href = href;
            })
        }
    };

    /**
     *  Add External Stylesheet to <HEAD> Using <SCRIPT>
     * @param src
     * @param async
     */
    dash.addScript = function (src: string, async = true) {
        const script = document.createElement('script');

        return {
            script,
            promise: new Promise<void>((resolve) => {
                const resolver = () => resolve();
                script.onload = resolver;
                script.onerror = resolver;
                script.async = async;
                HEAD.append(script);

                script.src = src;
            })
        }
    };

    /**
     * Run Once in Declared Document after DOMContentLoaded
     * @param callback
     */
    dash.ready = function (callback: ChangedElementCallback) {
        READY_CALLBACKS[READY_CALLBACKS.length] = callback;

        if (LOADED) {
            callback(BODY);
        }

        return dash;
    }

    /**
     * Run Everytime in Every Document after DOMContentLoaded
     * @param callback
     */
    dash.load = function (callback: ChangedElementCallback) {
        LOAD_CALLBACKS[LOAD_CALLBACKS.length] = callback;

        if (LOADED) {
            callback(BODY);
        }

        return dash;
    }

    dash.unload = function (callback: Function) {
        UNLOAD_CALLBACKS[UNLOAD_CALLBACKS.length] = callback;

        return dash;
    }

    /**
     * Run Everytime in Declared Document after DOMContentLoaded
     * @param callback
     */
    dash.enter = function (callback: ChangedElementCallback) {
        const store = PAGES[CURRENT_PATH].enterCallbacks;
        store[store.length] = callback;

        if (LOADED) {
            callback(BODY);
        }

        return dash;
    }

    /**
     * Run Everytime in Declared Document after beforeunload
     * @param callback
     */
    dash.exit = function (callback: Function) {
        const store = PAGES[CURRENT_PATH].exitCallbacks;
        store[store.length] = callback;

        return dash;
    };

    /**
     * Move to Other Document
     * @param href
     * @param htmlSelectors
     */
    dash.route = function (href: string, htmlSelectors?: string[]) {
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
    }

    /**
     * Signal for DOM Changed by any codes
     * @param target
     */
    dash.changed = function (target: HTMLElement = BODY) {
        const end = LOAD_CALLBACKS.length;
        let current = -1;

        while (++current < end) {
            LOAD_CALLBACKS[current](target);
        }

        return dash;
    }

    function route(this: any, href: string, htmlSelectors?: string[]) {
        const styleElements = getStyleElement(HTML);
        const scriptElements = getScriptElement(HTML);

        const styles = [];
        const scripts = [];

        let current = styleElements.length;
        while (current-- > 0) {
            const style = styleElements[current];
            const href = getAbsoluteUrl(style, 'href');
            styles[styles.length] = href;
            RENDERED_STYLES[href] = style;
        }

        current = scriptElements.length;
        while (current-- > 0) {
            const script = scriptElements[current];
            const src = getAbsoluteUrl(script, 'src');
            scripts[scripts.length] = src;
            RENDERED_SCRIPTS[script.src] = script;
        }

        const startPage = PAGES[CURRENT_PATH];
        startPage.title = document.title;
        startPage.styles = styles;
        startPage.scripts = scripts;
        startPage.html = START_HTML;

        START_HTML = null as any;

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
        return (route = function (href, htmlSelectors?) {
            // console.debug(`[dash] ${href}`);

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

            const cache = PAGES[CURRENT_PATH];

            if (cache) {
                if (CONFIGURE.enableKeepHtml) {
                    render(cache);
                } else {
                    request(href)
                        .then(html => {
                            cache.html = html;
                            render(cache);
                        })
                }
            } else {
                request(href)
                    .then(html => {
                        parse(href, html, htmlSelectors);
                    });
            }
        }).apply(this, arguments as any);

        function request(href: string) {
            FETCH_CONTROLLER = new AbortController();

            return fetch(href, {
                signal: FETCH_CONTROLLER.signal
            })
                .then(responseText)
                .catch(catchError) as Promise<string>;
        }

        function responseText(response: Response) {
            return response.text();
        }

        function catchError(reason: Error) {
            console.warn(reason);
            if (!(reason instanceof DOMException)) {
                console.warn(reason)
            }
        }
    }

    function parse(href: string, rawHtml: string, htmlSelectors?: string[]) {
        const page = getPage(rawHtml, href, htmlSelectors);

        PAGES[CURRENT_PATH] = page;

        render(page);
    }

    function getHref(href: string) {
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
                href = (
                    href.substring(0, searchIndex)
                    + (
                        hashIndex > -1 ?
                            href.substring(hashIndex) :
                            ''
                    )
                );
            }
        }
        return href;
    }

    function getPage(rawHtml: string, href: string, htmlSelectors?: string[]) {
        FRAGMENT_HTML.innerHTML = rawHtml;

        const title = (FRAGMENT_HTML.getElementsByTagName('TITLE')[0] as HTMLElement || {}).innerText || href;


        let current: number;

        const {classSelectors} = CONFIGURE;

        let classMap: null | Record<string, string> = null;
        if (classSelectors) {
            classMap = {};
            current = classSelectors.length
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
            const script = scriptElements[current];
            if (script?.parentNode) {
                script.parentNode.removeChild(script);
            }
        }

        let html: string;
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
        } else {
            html = FRAGMENT_HTML.outerHTML;
        }

        const page = new Page;

        page.title = title;
        page.title = title
        page.styles = styles
        page.scripts = scripts
        page.classes = classMap
        page.html = html

        return page;
    }

    function render(page: Page) {
        const {title, styles, scripts, classes, html} = page;

        if (title) {
            document.title = title;
        }

        const {htmlSelectors, classSelectors} = CONFIGURE;

        if (classSelectors && classes) {
            let current = classSelectors.length;
            while (current-- > 0) {
                const selector = classSelectors[current];
                const target = HTML.querySelector(selector);
                if (target) {
                    target.className = classes[selector];
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
                    const parent = to.parentNode as HTMLElement;
                    parent.replaceChild(from, to);
                }
            }
        } else {
            BODY.innerHTML = '';
            BODY.append(...(
                FRAGMENT_HTML.getElementsByTagName('BODY')[0]
                || FRAGMENT_HTML).children
            );
        }

        FRAGMENT_HTML.innerHTML = '';


        const {addScript, addStyle} = dash;
        const elements = [];
        const imports = [Promise.resolve()];
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
            imports[imports.length] = promise;
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
            const {script, promise} = addScript(src);
            RENDERED_SCRIPTS[src] = script;
            imports[imports.length] = promise;
            elements[elements.length] = script;
        }

        if (elements.length) {
            HEAD.append(...elements);
        }

        Promise.all(imports)
            .then(() => {
                let current = removeStyles.length;
                while (current-- > 0) {
                    const link = removeStyles[current];
                    link!.parentNode!.removeChild(link);
                }
                onLoad();
            })
    }

    function getStyleElement(container: HTMLElement): Children<HTMLLinkElement> {
        const result = [];
        const styles = FROM(container.querySelectorAll('link[rel=stylesheet]')) as Children<HTMLLinkElement>;
        const end = styles.length;
        let current = -1;
        while (++current < end) {
            const link = styles[current];
            if (link.getAttribute('href') && link.href.startsWith(ORIGIN)) {
                result[result.length] = link;
            }
        }
        return result;
    }

    function getStyleHref(styles: HTMLLinkElement[]) {
        const result = [];
        let current = styles.length;
        while (current-- > 0) {
            result[result.length] = getAbsoluteUrl(styles[current], 'href');
        }
        return result;
    }

    function getScriptElement(container: HTMLElement) {
        const result = [];
        const scripts = container.querySelectorAll('script[src]') as any as HTMLScriptElement[];
        const end = scripts.length;
        let current = -1;
        while (++current < end) {
            const script = scripts[current];
            if (script.getAttribute('src') && script.src.startsWith(ORIGIN)) {
                result[result.length] = script;
            }
        }
        return result;
    }

    function getScriptSrc(scripts: HTMLScriptElement[]) {
        const result = [];
        let current = scripts.length;
        while (current-- > 0) {
            result[result.length] = getAbsoluteUrl(scripts[current], 'src');
        }
        return result;
    }

    function getAbsoluteUrl(node: HTMLElement, attribute: string) {
        return '' + (new URL(node.getAttribute(attribute) as string, CURRENT_PATH));
    }

    function onLoad() {
        // console.debug('[dash] before load');

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
        // console.debug('[dash] after load');
        HTML.style.visibility = 'inherit';
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

    function onLoaded(changedElement = BODY) {
        // console.debug('[dash] Loaded');
        LOADED = true;

        const store = PAGES[CURRENT_PATH];

        const callbacks = READY_CALLBACKS.concat(
            LOAD_CALLBACKS,
            store.enterCallbacks
        );

        const end = callbacks.length;
        let current = -1;

        while (++current < end) {
            callbacks[current](changedElement);
        }
    }

    addEventListener(
        'click',
        function onClick(event) {
            let node = event.target as DashAnchor;
            const {tagName} = node;

            if (tagName === 'BODY') {
                return false
            }

            if (tagName !== 'A') {
                if (node?._dashAnchor === false) {
                    return true;
                }

                const anchor = node.closest('a') as DashAnchor;
                if (!anchor || !anchor.href) {
                    node._dashAnchor = false;
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
                node._dashAnchor = false;
                return true;
            }

            node._dashAnchor = node;

            const inlineOutlet = node?.dataset?.outlet;

            dash.route(node.href, inlineOutlet ? inlineOutlet.split(',') : undefined);

            event.stopPropagation();
            event.preventDefault();

            return false;
        }
    );

    addEventListener(
        'popstate',
        function onPopstate(event) {
            const {state} = event;

            if (state instanceof State) {
                route(state.dash.href);
            }

            return true;
        }
    );

    addEventListener(
        'DOMContentLoaded',
        function onDOMContentLoaded() {
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
        }
    );

    return dash;
})(window, document);
