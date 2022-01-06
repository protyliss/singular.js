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

interface DashDOMBase {
    title: string;
    styles: string[];
    scripts: string[];

    classMap: null | Record<string, string>;

    html: string;
    fragmentHtml: HTMLHtmlElement
}

interface DashDOM extends DashDOMBase {
    enterCallbacks: ChangedElementCallback[];
    exitCallbacks: Function[];
}

interface DashState {
    dash: {
        href: string
    }
}

type VoidPromiseCallback = (...args: any) => Promise<void>;
type DashAnchor = HTMLAnchorElement & { _dashAnchor?: false | HTMLAnchorElement };
type Child<T = HTMLElement> = T & { parentNode: HTMLElement };
type Children<T> = Array<Child<T>>;

type ChangedElementCallback = (changedElement: HTMLElement) => void;

let HTML: HTMLElement;
let HEAD: HTMLHeadElement;
let BODY: HTMLElement;
let START_HTML: string;

const {href: START_PATH, origin: ORIGIN} = location;
const {from: FROM} = Array;
const resolveFactory = () => Promise.resolve();

const DOM: Record<string, DashDOM> = {
    [START_PATH]: ({
        enterCallbacks: [],
        exitCallbacks: []
    } as any as DashDOM)
}

const READY_CALLBACKS: ChangedElementCallback[] = [];
const LOAD_CALLBACKS: ChangedElementCallback[] = [];
const UNLOAD_CALLBACKS: Function[] = [];

const LOAD_SERIES: VoidPromiseCallback[] = [resolveFactory];
const LOAD_PARALLEL: VoidPromiseCallback[] = [resolveFactory];

const CONFIGURE: DashConfigure = {
    development: false,
    htmlSelectors: null,
    classSelectors: null,
    enableKeepStyles: false,
    enableSearchString: false,
    enableHashString: false
}

let RENDERED_STYLES: Record<string, HTMLLinkElement> = {};

let RENDERED_SCRIPTS: Record<string, HTMLScriptElement> = {};

let LOADED = false

let CURRENT_PATH = START_PATH;

const FRAGMENT_HTML = (() => {
    const fragment = document.createDocumentFragment();
    const fragmentHtml = document.createElement('html');
    fragment.appendChild(fragmentHtml);

    return fragmentHtml;
})();

let FETCH_CONTROLLER: AbortController;

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
 * Set Series Callback Before Initialize to Load
 * @description
 *   Callbacks Call as Single Thread
 *   If Previous Callback to failed, Does not Move to Next Callback.
 * @param callback
 */
dash.require = function (callback: VoidPromiseCallback) {
    LOAD_SERIES[LOAD_SERIES.length] = callback;
    return dash;
}

/**
 * Set Parallel Callback Before Initialize to Load
 * @description
 *   Callbacks Call as Multiple Thread
 * @param callback
 */
dash.asyncRequire = function (callback: VoidPromiseCallback) {
    LOAD_PARALLEL[LOAD_PARALLEL.length] = callback;
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
 * Add External Stylesheet to <HEAD> Using <SCRIPT>
 * @param href
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
    const store = DOM[CURRENT_PATH].enterCallbacks;
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
    const store = DOM[CURRENT_PATH].exitCallbacks;
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

    history.pushState(
        {
            dash: {href}
        } as DashState,
        href,
        href
    );
}

/**
 * Signal for DOM Changed by any codes
 * @param target
 */
dash.changed = function (target: HTMLElement = BODY) {
    const end = READY_CALLBACKS.length;
    let current = -1;

    while (++current < end) {
        READY_CALLBACKS[current](target);
    }

    return dash;
}


function route(this: any, href: string, htmlSelectors?: string[]) {
    let dom = getDOMBase(START_HTML, href, CONFIGURE.htmlSelectors as string[]);
    START_HTML = null as any;

    const startDom = DOM[CURRENT_PATH];

    startDom.title = document.title;
    startDom.styles = dom.styles;
    startDom.scripts = dom.scripts;
    startDom.html = dom.html;

    RENDERED_STYLES = getStyleElement(HTML).reduce(
        (map, link) => {
            map[link.href] = link;
            return map;
        },

        {} as Record<string, HTMLLinkElement>
    );

    RENDERED_SCRIPTS = getScriptElement(HTML).reduce(
        (map, script) => {
            map[script.src] = script;
            return map;
        },
        {} as Record<string, HTMLScriptElement>
    );

    FROM(document.links).forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (!href || !(href.startsWith('./') || href.startsWith('../'))) {
            return null;
        }

        anchor.setAttribute('href', anchor.href);
    });

    // @ts-ignore
    return (route = function (href, htmlSelectors?) {
        // console.debug(`[dash] ${href}`);

        if (LOADED) {
            const callbacks = DOM[CURRENT_PATH].exitCallbacks.concat(UNLOAD_CALLBACKS);
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

        LOADED = false;
        CURRENT_PATH = getDOMHref(href);

        window.scrollTo(0, 0);
        document.title = href.substring(href.indexOf(':') + 3);

        const cache = DOM[CURRENT_PATH];

        if (cache) {
            // console.debug(cache);
            render(cache);
        } else {
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
                        console.warn(reason)
                    }
                });
        }
    }).apply(this, arguments as any);

    function responseText(response: Response) {
        return response.text();
    }
}

function parse(href: string, rawHtml: string, htmlSelectors?: string[]) {
    const dom: DashDOM = {
        ...getDOMBase(rawHtml, href, htmlSelectors),
        enterCallbacks: [],
        exitCallbacks: []
    }

    DOM[CURRENT_PATH] = dom;

    render(dom);
}

function getDOMHref(href: string) {
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

function getDOMBase(rawHtml: string, href: string, htmlSelectors?: string[]): DashDOMBase {
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
        removeChild(scriptElements[current]);
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

    return {
        fragmentHtml: FRAGMENT_HTML,
        title,
        styles,
        scripts,
        classMap,
        html
    }
}

function render(dom: DashDOM) {
    const {title, styles, scripts, classMap, html} = dom;

    if (title) {
        document.title = title;
    }

    const {htmlSelectors, classSelectors} = CONFIGURE;

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


    const {addScript, addStyle} = dash;
    const elements = [];
    const onLoads = [Promise.resolve()];

    let end: number;
    let current: number;

    const removeStyles: Children<HTMLLinkElement> = [];

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
        const {link, promise} = addStyle(href);
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
        const {script, promise} = addScript(src);
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

function getStyleElement(container: HTMLElement): Children<HTMLLinkElement> {
    return (FROM(container.querySelectorAll('link[rel=stylesheet]')) as Children<HTMLLinkElement>)
        .filter(styleFilterFunction)
}

function styleFilterFunction(link: HTMLLinkElement) {
    return !!(link.getAttribute('href') && link.href.startsWith(ORIGIN));
}

function getStyleHref(styles: HTMLLinkElement[]) {
    return styles.map(linkHrefMapFunction)
}

function linkHrefMapFunction(link: HTMLLinkElement) {
    return getAbsoluteUrl(link, 'href');
}

function getScriptElement(container: HTMLElement) {
    return (FROM(container.querySelectorAll('script[src]')) as HTMLScriptElement[])
        .filter(scriptFilterFunction);
}

function getScriptSrc(scripts: HTMLScriptElement[]) {
    return scripts.map(scriptSrcMapFunction);
}

function scriptFilterFunction(script: HTMLScriptElement) {
    return script.getAttribute('src') && script.src.startsWith(ORIGIN);
}

function scriptSrcMapFunction(script: HTMLScriptElement) {
    return getAbsoluteUrl(script, 'src');
}

function getAbsoluteUrl(node: HTMLElement, attribute: string) {
    return '' + (new URL(node.getAttribute(attribute) as string, CURRENT_PATH));
}

function removeChild(node: HTMLElement) {
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
            } catch (reason) {
                console.warn(reason)
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

function seriesReduceFunction(promise: Promise<void>, callback: VoidPromiseCallback) {
    return promise.then(() => {
        return callback();
    });
}

function promiseMapFunction(callback: VoidPromiseCallback) {
    return callback();
}


function bodyOnClick(event: MouseEvent) {
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

    dash.route(
        node.href,
        inlineOutlet ?
            inlineOutlet.split(',') :
            undefined
    );

    return stop(event);
}

function onPopstate(event: PopStateEvent) {
    const state = event.state as DashState;
    if (state && state.dash) {
        route(state.dash.href);
    }
    return true;
}

function stop(event: Event) {
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
        DOM[CURRENT_PATH] = {...DOM[START_PATH]};
        delete DOM[START_PATH];
    }

    onLoad();
}

addEventListener('DOMContentLoaded', initialize);
addEventListener('popstate', onPopstate);
addEventListener('click', bodyOnClick);

export default dash;
