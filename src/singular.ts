interface SingularConfigure {
    /**
     * Set Development Mode
     * @description
     *   Does not Reload Page after Occurred Error
     * @default false
     */
    development: boolean;
    /**
     * Changeable Element Selector after Routed
     * @default null
     */
    outletSelectors: undefined | null | string;

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

    /**
     * Disable Change Browser Title after Routed
     * @default false
     */
    disableTitleChange: boolean
}

type VoidPromiseCallback = (...args: any) => Promise<void>;
type SingularAnchor = HTMLAnchorElement & { _singularAnchor?: false | HTMLAnchorElement };
type Child<T = HTMLElement> = T & { parentNode: HTMLElement };
type Children<T> = Array<Child<T>>;
type ChangedElementCallback = (changedElements: ChangedElements) => void;

document.documentElement.style.visibility = 'hidden';

const {href: START_URL, origin: ORIGIN} = location;
const {isArray: IS_ARRAY, from: FROM} = Array;
const {keys: KEYS} = Object;

const ESM = !document.currentScript;

let CONFIGURE: SingularConfigure = {
    development: false,
    outletSelectors: null,
    classSelectors: null,
    enableKeepHtml: false,
    enableKeepStyles: false,
    enableSearchString: false,
    enableHashString: false,
    disableTitleChange: false
};

let RENDERED_STYLES: Record<string, HTMLLinkElement> = {};
let RENDERED_SCRIPTS: Record<string, HTMLScriptElement> = {};
let LOADED = false
let CURRENT_URL = START_URL;
let CURRENT_SCRIPT_URL = START_URL;
let ABORT_CONTROLLER: AbortController;

class Page {
    constructor(
        public url: string,
        public title: string,
        public styles: string[] = [],
        public scripts: string[] = [],
        public classes: Record<string, string> | undefined = undefined,
        public html: string = ''
    ) {
    }
}

class Lifecycle {
    static seriesCallbacks: VoidPromiseCallback[] = [];
    static parallelCallbacks: VoidPromiseCallback[] = [];
    static readyCallbacks: ChangedElementCallback[] = [];
    static loadCallbacks: ChangedElementCallback[] = [];
    static unloadCallbacks: Function[] = [];

    enterCallbacks: ChangedElementCallback[] = [];
    exitCallbacks: Function[] = [];
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

class ChangedElements extends Array<Element> {
    constructor(changedElements: Element[]) {
        super(0);
        this.push.apply(
            this,
            IS_ARRAY(changedElements) ?
                changedElements :
                [changedElements]
        );
    }

    #getElements<E extends Element = Element>(methodName: keyof Element, selectors: keyof HTMLElementTagNameMap | string): E[] {
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

        return list as E[];
    }

    getElementById(elementId: string) {
        return document.getElementById(elementId);
    }

    getElementsByTagName<K extends keyof HTMLElementTagNameMap>(qualifiedName: K): HTMLElementTagNameMap[K][];
    getElementsByTagName<K extends keyof SVGElementTagNameMap>(qualifiedName: K): SVGElementTagNameMap[K][];
    getElementsByTagName<E extends Element = Element>(qualifiedName: string): E[] {
        return this.#getElements('getElementsByTagName', qualifiedName);
    }

    getElementsByClassName(classNames: string) {
        return this.#getElements('getElementsByClassName', classNames);
    }

    querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K];
    querySelector<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K];
    querySelector<E extends Element = Element>(selectors: string): E | null {
        const end = this.length;
        let current = -1;
        while (++current < end) {
            const node = this[current].querySelector(selectors);
            if (node) {
                return node as E;
            }
        }
        return null;
    }

    querySelectorAll<E extends Element = Element>(selectors: keyof HTMLElementTagNameMap | string): E[] {
        return this.#getElements('querySelectorAll', selectors);
    }
}

const PAGES: Record<string, Page> = {
    [START_URL]: new Page(
        START_URL,
        document.title
    )
};

const LIFECYCLES: Record<string, Lifecycle> = {
    [START_URL]: new Lifecycle
};

export const chaining = {
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

/**
 * Set Configure
 * @param values
 */
export function configure(values: Partial<SingularConfigure>) {
    let {classSelectors} = values;

    if (classSelectors) {
        if (!IS_ARRAY(classSelectors)) {
            classSelectors = [classSelectors];
        }
        let current = classSelectors.length;
        const dividedClassSelectors = [];
        while (current-- > 0) {
            dividedClassSelectors.push(...classSelectors[current].split(','));
        }
        values.classSelectors = dividedClassSelectors;
    }

    CONFIGURE = Object.assign(CONFIGURE, values);

    return chaining;
}

/**
 * Add External Stylesheet to <HEAD> Using <LINK>
 * @param href
 */
export function addStyle(href: string) {
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
}

/**
 *  Add External Stylesheet to <HEAD> Using <SCRIPT>
 * @param src
 * @param async
 */
export function addScript(src: string, async = true) {
    const script = tag('script');

    return {
        script,
        promise: new Promise<void>((resolve) => {
            const resolver = () => resolve();

            if (ESM) {
                script.type = 'module';
            }

            script.onload = resolver;
            script.onerror = resolver;
            script.async = async;
            document.head.append(script);

            script.src = src;
        })
    }
}

/**
 * Set Parallel Callback for Bootstrap
 * @description
 *   Callbacks Call as Multiple Thread
 * @param callback
 */
export function parallel(callback: VoidPromiseCallback) {
    Lifecycle.parallelCallbacks[Lifecycle.parallelCallbacks.length] = callback;
    return chaining;
}

/**
 * Set Series Callback for Bootstrap
 * @description
 *   Callbacks Call as Single Thread
 *   If Previous Callback to failed, Does not Move to Next Callback.
 * @param callback
 */
export function series(callback: VoidPromiseCallback) {
    Lifecycle.seriesCallbacks[Lifecycle.seriesCallbacks.length] = callback;
    return chaining;
}

/**
 * Run Once in Declared Document after DOMContentLoaded
 * @param callback
 */
export function ready(callback: ChangedElementCallback) {
    Lifecycle.readyCallbacks[Lifecycle.readyCallbacks.length] = callback;

    if (LOADED) {
        callback(new ChangedElements([document.body]));
    }

    return chaining;
}

/**
 * Run Everytime in Every Document after DOMContentLoaded
 * @param callback
 */
export function load(callback: ChangedElementCallback) {
    Lifecycle.loadCallbacks[Lifecycle.loadCallbacks.length] = callback;

    if (LOADED) {
        callback(new ChangedElements([document.body]));
    }

    return chaining;
}

/**
 * Run Everytime in Declared Document after DOMContentLoaded
 * @alias singular
 * @param callback
 */
export function enter(callback: ChangedElementCallback) {
    const {enterCallbacks} = LIFECYCLES[CURRENT_SCRIPT_URL];
    enterCallbacks[enterCallbacks.length] = callback;

    if (LOADED) {
        callback(new ChangedElements([document.body]));
    }

    return chaining;
}

/**
 * Run Everytime in Declared Document after beforeunload
 * @param callback
 */
export function exit(callback: Function) {
    const {exitCallbacks} = LIFECYCLES[CURRENT_SCRIPT_URL];
    exitCallbacks[exitCallbacks.length] = callback;

    return chaining;
}

export function unload(callback: Function) {
    Lifecycle.unloadCallbacks[Lifecycle.unloadCallbacks.length] = callback;

    return chaining;
}

/**
 * Move to Other Document
 * @param requestUrl
 * @param outletSelectors
 */
export function route(requestUrl: string, outletSelectors?: string) {
    try {
        route$(requestUrl, outletSelectors)
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
 * @param changedElements
 */
export function changed(changedElements: Element[] = [document.body]) {
    const changedElements_ = new ChangedElements(changedElements);

    const end = Lifecycle.loadCallbacks.length;
    let current = -1;

    while (++current < end) {
        Lifecycle.loadCallbacks[current](changedElements_);
    }

    return chaining;
}


function tag<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] {
    return document.createElement(tagName);
}

function fragmentHtml(html: string) {
    const fragment = document.createDocumentFragment();
    const fragmentHtml = tag('html');
    fragment.appendChild(fragmentHtml);
    fragmentHtml.innerHTML = html;
    return fragmentHtml;
}


function route$(
    this: any,
    requestUrl: string,
    outletSelectors: undefined | null | string = undefined,
    push = true
): Promise<Element[]> {

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

    const page = PAGES[CURRENT_URL];
    page.url = START_URL;
    page.title = document.title;
    page.styles = styleUrls;
    page.scripts = scriptUrls;
    page.classes = getClassNameMap(document);

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
    return (route$ = routeAfterFirstRouted).apply(this, arguments as any);

    function routeAfterFirstRouted(
        requestUrl: string,
        outletSelectors: undefined | null | string = undefined,
        push = true
    ) {
        // console.debug(`[singular] ${href}`);

        if (LOADED) {
            const lifecycle = LIFECYCLES[CURRENT_SCRIPT_URL]
            const callbacks = lifecycle.exitCallbacks.concat(Lifecycle.unloadCallbacks);
            const end = callbacks.length;
            let current = -1;

            try {
                while (++current < end) {
                    callbacks[current]();
                }
            } catch (reason) {
                console.warn(reason);
            }
        } else if (ABORT_CONTROLLER) {
            ABORT_CONTROLLER.abort();
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
                return render$(page);
            }
            // noinspection JSUnusedLocalSymbols
            return request(requestUrl)
                .then(([responseUrl, html]) => {
                    page.html = html;
                    push && pushState(responseUrl);
                    return render$(page);
                });
        }

        return request(requestUrl)
            .then(([responseUrl, html]) => {
                push && pushState(responseUrl);
                return parse$(requestUrl, responseUrl, html);
            });
    }

    function request(href: string) {
        ABORT_CONTROLLER = new AbortController();

        return fetch(href, {
            signal: ABORT_CONTROLLER.signal
        })
            .then(responseText)
            .catch(catchError) as Promise<[string, string]>;
    }

    function responseText(response: Response) {
        const {url} = response;
        return Promise.all([
            Promise.resolve(url),
            response.text()
        ]);
    }

    function catchError(reason: Error) {
        console.warn(reason);
    }

    function pushState(responseUrl: string) {
        history.pushState(new State(responseUrl), responseUrl, responseUrl);
    }

    function getFixedUrl(responseUrl: string, requestUrl: string): string {
        const parsedResponseUrl = new URL(responseUrl);
        const parsedRequestUrl = new URL(requestUrl);

        parsedResponseUrl.search = parsedRequestUrl.search;
        parsedResponseUrl.hash = parsedRequestUrl.hash;

        return '' + parsedRequestUrl;
    }
}

function getClassNameMap(target: Document | HTMLElement) {
    const {classSelectors} = CONFIGURE;
    if (classSelectors) {
        const classes: Record<string, string> = {};
        let current = classSelectors.length
        while (current-- > 0) {
            const selector = classSelectors[current];
            classes[selector] = (target.querySelector(selector) || {}).className || '';
        }
        return classes;
    }
    return undefined;
}


function parse$(requestUrl: string, responseUrl: string, rawHtml: string): Promise<void | Element[]> {
    const fragment = fragmentHtml(rawHtml)
    const title = (fragment.getElementsByTagName('TITLE')[0] as HTMLElement || {}).innerText || requestUrl;


    const {urls: styleUrls} = getStyles(fragment);
    const {entries: scriptEntries, urls: scriptUrls} = getScripts(fragment);

    let current = scriptEntries.length;
    while (current-- > 0) {
        const [node] = scriptEntries[current];
        if (node?.parentNode) {
            node.parentNode.removeChild(node);
        }
    }

    let html = fragment.outerHTML;

    const page = new Page(
            responseUrl,
            title,
            styleUrls,
            scriptUrls,
            getClassNameMap(fragment),
            html
        )
    ;

    const url = new URL(CURRENT_URL);
    if (url.pathname.endsWith('/')) {
        url.pathname = url.pathname.substring(0, url.pathname.length - 1);
    }
    PAGES['' + url] = page;
    const scriptUrl = getScriptUrl('' + url);

    if (!LIFECYCLES[scriptUrl]) {
        LIFECYCLES[scriptUrl] = new Lifecycle();
    }

    return render$(page);
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

function getScriptUrl(href: string) {
    const url = new URL(href);
    url.hash = '';
    url.search = '';

    let {pathname} = url;
    if (pathname.endsWith('/')) {
        url.pathname = pathname.substring(0, pathname.length - 1);
    }

    return '' + url;
}

/**
 *
 * @param page
 */
function render$(page: Page): Promise<void | Element[]> {
    const {url, title, styles, scripts, classes, html} = page;
    const {outletSelectors, classSelectors} = CONFIGURE;

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
    let changedElements: Element[];
    if (outletSelectors) {
        const currentElements = document.querySelectorAll(outletSelectors);
        changedElements = Array.from(fragment.querySelectorAll(outletSelectors));


        if (changedElements.length === currentElements.length) {

            let current = changedElements.length;
            while (current-- > 0) {
                const fragmentElement = changedElements[current];
                const currentElement = currentElements[current];

                if (fragmentElement.tagName !== currentElement.tagName) {
                    changeAll = true;
                    break;
                }

            }

            if (!changeAll) {
                current = changedElements.length;
                while (current-- > 0) {
                    const from = changedElements[current];
                    const to = currentElements[current];
                    (to.parentNode as HTMLElement).replaceChild(from, to);
                }
            }
        } else {
            changeAll = true;
        }
    } else {
        changeAll = true;
    }

    if (changeAll) {
        document.body.innerHTML = (fragment.getElementsByTagName('BODY')[0] || fragment).innerHTML;
        changedElements = [document.body];
    }

    fragment.innerHTML = '';

    const elements = [];
    const importPromises = [Promise.resolve()];
    const removeStyles: HTMLLinkElement[] = [];
    let end: number;
    let current: number;

    if (!CONFIGURE.enableKeepStyles) {
        const renderedStyleHrefs = KEYS(RENDERED_STYLES);
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

    return Promise.all(importPromises)
        .then(() => {
            let current = removeStyles.length;
            while (current-- > 0) {
                const link = removeStyles[current];
                if (link && link.parentNode) {
                    link.parentNode.removeChild(link);
                }
            }

            return onLoad$(changedElements);
        });
}

function getResources<T extends HTMLElement>(parentElement: HTMLElement, selector: string, attributeName: string) {
    const entries: Array<[T, string]> = [];
    const urls: string[] = [];
    const nodes = FROM(parentElement.querySelectorAll(selector)) as Children<T>;
    const end = nodes.length;
    let current = -1;
    while (++current < end) {
        const node = nodes[current];

        if (!node.getAttribute(attributeName) || !(node as any)[attributeName].startsWith(ORIGIN)) {
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

function onLoad$(changedElements: Element[]): Promise<void | Element[]> {
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

    return Promise.all(prepares)
        .then(() => {
            return onLoading$(changedElements)
        })
        .catch(catchReload);
}

function onLoading$(changedElements: Element[]) {
    // console.debug('[singular] after load');
    document.documentElement.style.visibility = 'inherit';

    try {
        onLoaded(new ChangedElements(changedElements));
    } catch (reason) {
        console.warn(reason)
    }

    return changedElements;
}

function catchReload(reason: Error) {
    console.warn(reason);
    if (!CONFIGURE.development) {
        location.reload();
    }
}

function onLoaded(changedElements: ChangedElements) {
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
        callbacks[current](changedElements);
    }
}


addEventListener(
    'click',
    function singularOnClick(event) {
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

        if (node.target
            || node.download
            || !href.startsWith(ORIGIN)
            || (rawHref && rawHref.startsWith('#'))
        ) {
            node._singularAnchor = false;
            return true;
        }

        node._singularAnchor = node;

        event.stopPropagation();
        event.preventDefault();

        route(href, node.dataset?.outlet || undefined);

        return false;
    }
);

addEventListener(
    'popstate',
    function singularOnPopstate(event) {
        const {state} = event;

        if (state && state.singular) {
            route$(state.singular.href, undefined, false)
                .then();
        }

        return true;
    }
);

addEventListener(
    'DOMContentLoaded',
    function singularOnDOMContentLoaded() {
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

        onLoad$([document.documentElement])
            .then();
    }
);
