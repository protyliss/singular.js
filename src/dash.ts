interface DashConfigure {
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
    run: ChangedElementCallback[];
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
        run: []
    } as any as DashDOM)
}

const GLOBAL_RUN: ChangedElementCallback[] = [];

const LOAD_SERIES: VoidPromiseCallback[] = [resolveFactory];
const LOAD_PARALLEL: VoidPromiseCallback[] = [resolveFactory];

let RENDERED_STYLES: Record<string, HTMLLinkElement> = {};

let RENDERED_SCRIPTS: Record<string, HTMLScriptElement> = {};

let LOADED = false

let CURRENT_PATH = START_PATH;

const CONFIGURE: DashConfigure = {
    htmlSelectors: null,
    classSelectors: null,
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

function dash(callback: VoidPromiseCallback) {
    return dash.run(callback)
}

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


dash.load = function (callback: VoidPromiseCallback) {
    LOAD_SERIES[LOAD_SERIES.length] = callback;
    return dash;
}

dash.loadParallel = function (callback: VoidPromiseCallback) {
    LOAD_PARALLEL[LOAD_PARALLEL.length] = callback;
    return dash;
}

dash.loadStyle = function (href: string) {
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

dash.loadScript = function (src: string, async = true) {
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

dash.run = function (callback: ChangedElementCallback) {
    const store = DOM[CURRENT_PATH].run;
    store[store.length] = callback;

    if (LOADED) {
        callback(BODY);
    }

    return dash;
}

dash.runEvery = function (callback: ChangedElementCallback) {
    GLOBAL_RUN[GLOBAL_RUN.length] = callback;

    if (LOADED) {
        callback(BODY);
    }

    return dash;
}

dash.route = function (href: string, htmlSelectors?: string[]) {
    try {
        route(href, htmlSelectors);
    } catch (reason) {
        console.debug(reason);
        location.replace(href);
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

dash.changed = function (target: HTMLElement = BODY) {
    const end = GLOBAL_RUN.length;
    let current = -1;

    while (++current < end) {
        GLOBAL_RUN[current](target);
    }

    return dash;
}


function route(this: any, href: string, htmlSelectors?: string[]) {
    let dom = getDOMBase(START_HTML, href, CONFIGURE.htmlSelectors as string[]);
    START_HTML = null as any;

    const startDom = DOM[START_PATH];

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
        // console.debug(`[dash] Route: ${href}`);

        if (!htmlSelectors) {
            htmlSelectors = CONFIGURE.htmlSelectors;
        }

        LOADED = false;
        CURRENT_PATH = href;

        window.scrollTo(0, 0);
        document.title = href.substring(href.indexOf(':') + 3);

        const cache = DOM[href];

        if (cache) {
            render(cache);
        } else {
            fetch(href)
                .then(responseText)
                .then(html => {
                    parse(href, html, htmlSelectors);
                })
                .catch(reason => console.warn(reason));
        }
    }).apply(this, arguments as any);

    function responseText(response: Response) {
        return response.text();
    }
}


function parse(href: string, rawHtml: string, htmlSelectors?: string[]) {
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

    const dom: DashDOM = {
        ...getDOMBase(rawHtml, href, htmlSelectors),
        run: []
    }

    DOM[href] = dom;

    render(dom);
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


    const {loadStyle, loadScript} = dash;
    const elements = [];
    const onLoads = [Promise.resolve()];

    let end: number;
    let current: number;

    const removeStyles: Children<HTMLLinkElement> = [];

    if (!CONFIGURE.enableKeepStyles) {
        const renderedStyleHrefs = Object.keys(RENDERED_STYLES);

        current = renderedStyleHrefs.length;
        while (current-- > 0) {
            let href = renderedStyleHrefs[current];
            if (styles.indexOf(href) > -1) {
                continue;
            }
            removeStyles[removeStyles.length] = RENDERED_STYLES[href] as Child<HTMLLinkElement>;
            delete RENDERED_STYLES[href];
        }
    }

    // add external stylesheet
    end = styles.length;
    current = -1;
    while (++current < end) {
        const href = styles[current];
        if (RENDERED_STYLES[href]) {
            continue;
        }
        const {link, promise} = loadStyle(href);
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
        const {script, promise} = loadScript(src);
        RENDERED_SCRIPTS[src] = script;
        onLoads[onLoads.length] = promise;
        elements[elements.length] = script;
    }

    if (elements.length) {
        HEAD.append(...elements);
    }

    Promise.all(onLoads)
        .then(() => {
            let current = removeStyles.length;
            while (current-- > 0) {
                removeChild(removeStyles[current]);
            }
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
    // console.debug('[dash] load');
    Promise.all([
        LOAD_SERIES.splice(1).reduce(seriesReduceFunction, Promise.resolve()),
        LOAD_PARALLEL.splice(1).map(promiseMapFunction)
    ])
        .then(() => {
            onLoaded();
        })
        .catch(reason => {
            console.warn(reason);
            location.reload();
        });
}

function onLoaded(changedElement = BODY) {
    // console.debug('[dash] Loaded');
    LOADED = true;

    const store = DOM[CURRENT_PATH];

    const callbacks = GLOBAL_RUN.concat(store.run);

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
    console.warn(rawHref);

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
    onLoad();
}

addEventListener('DOMContentLoaded', initialize);
addEventListener('popstate', onPopstate);
addEventListener('click', bodyOnClick);

export default dash;
