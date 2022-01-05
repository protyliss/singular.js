interface DashConfigure {
    outlet: undefined | null | string[];
}

interface DashDOM {
    title: string;
    styles: string[];
    scripts: string[];
    html: string;
    run: Function[];
}

interface DashState {
    dash: {
        href: string
    }
}

type voidPromiseCallback = (...args: any) => Promise<void>;
type DashAnchor = HTMLAnchorElement & { _dashAnchor?: false | HTMLAnchorElement };
type Child<T> = T & { parentNode: HTMLElement };
type Children<T> = Array<Child<T>>;

const {documentElement: HTML, head: HEAD, body: BODY} = document;
const {href: START_PATH, origin: ORIGIN} = location;
const {from: FROM} = Array;
const resolveFactory = () => Promise.resolve();

const DOM: Record<string, DashDOM> = {
    [START_PATH]: ({
        run: []
    } as any as DashDOM)
}

const GLOBAL_RUN: Function[] = [];

const LOAD_SERIES: voidPromiseCallback[] = [resolveFactory];
const LOAD_PARALLEL: voidPromiseCallback[] = [resolveFactory];

let RENDERED_STYLES: Record<string, HTMLLinkElement> = {};

let RENDERED_SCRIPTS: Record<string, HTMLScriptElement> = {};

let LOADED = false

let CURRENT_PATH = START_PATH;

const CONFIGURE: DashConfigure = {
    outlet: null
}

function dash(callback: voidPromiseCallback) {
    return dash.run(callback)
}

dash.configure = function (configure: Partial<DashConfigure>) {
    const keys = Object.keys(configure);

    let current = keys.length;
    while (current-- > 0) {
        const key = keys[current] as keyof DashConfigure;
        const value = configure[key];
        if (value) {
            CONFIGURE[key] = configure[key];
        }
    }

    if (configure.outlet && configure.outlet.indexOf('body') > -1) {
        configure.outlet = null;
    }

    return dash;
}


dash.load = function (callback: voidPromiseCallback) {
    LOAD_SERIES[LOAD_SERIES.length] = callback;
    return dash;
}

dash.loadParallel = function (callback: voidPromiseCallback) {
    LOAD_PARALLEL[LOAD_PARALLEL.length] = callback;
    return dash;
}

dash.loadStyle = function (href: string) {
    const link = document.createElement('link');

    return {
        link,
        promise: new Promise<void>((resolve, reject) => {
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
        promise: new Promise<void>((resolve, reject) => {
            const resolver = () => resolve();
            script.onload = resolver;
            script.onerror = resolver;
            script.async = async;
            HEAD.append(script);

            script.src = src;
        })
    }
};

dash.run = function (callback: Function) {
    const store = DOM[CURRENT_PATH].run;
    store[store.length] = callback;

    if (LOADED) {
        callback();
    }

    return dash;
}

dash.runEvery = function (callback: Function) {
    GLOBAL_RUN[GLOBAL_RUN.length] = callback;

    if (LOADED) {
        callback();
    }

    return dash;
}

dash.route = function (href: string, outlet = null) {
    try {
        route(href, outlet);
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


let START_HTML = HTML.outerHTML;

function route(this: any, href: string, outlet = null) {
    let dom = getDOM(START_HTML, href);
    START_HTML = null as any;

    const startDom = DOM[START_PATH];

    startDom.title = document.title;
    startDom.styles = dom.styles;
    startDom.scripts = dom.scripts;
    startDom.html = dom.html;

    dom = null as any;

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
    return (route = function (href, outlet?) {
        // console.debug(`[dash] Route: ${href}`);

        if (!outlet) {
            outlet = CONFIGURE.outlet;
        }

        LOADED = false;
        CURRENT_PATH = href;

        window.scrollTo(0, 0);
        document.title = href.substr(href.indexOf(':') + 3);

        const cache = DOM[href];

        if (cache) {
            render(cache);
        } else {
            fetch(href)
                .then(responseText)
                .then(html => {
                    parse(href, html, outlet);
                })
                .catch(reason => console.warn(reason));
        }
    }).apply(this, arguments as any);

    function responseText(response: Response) {
        return response.text();
    }
}


function parse(href: string, rawHtml: string, outlet?: string[]) {
    const {title, scripts, styles, html, fragmentHtml} = getDOM(rawHtml, href, outlet);

    const dom: DashDOM = {
        title,
        scripts,
        styles,
        html,
        run: []
    }

    DOM[href] = dom;

    render(dom, fragmentHtml);
}

function getDOM(rawHtml: string, href: string, outlet?: string[]) {
    const fragment = document.createDocumentFragment();
    const fragmentHtml = document.createElement('html');
    fragment.appendChild(fragmentHtml);

    fragmentHtml.innerHTML = rawHtml;

    const title = (fragmentHtml.getElementsByTagName('TITLE')[0] as HTMLElement || {innerText: 'Untitled'}).innerText;

    const styleElements = getStyleElement(fragmentHtml);
    const scriptElements = getScriptElement(fragmentHtml);

    const styles = getStyleHref(styleElements);
    const scripts = getScriptSrc(scriptElements);

    let current = scriptElements.length;
    while (current-- > 0) {
        removeChild(scriptElements[current]);
    }

    let html: string;
    if (outlet) {
        const targetHTML = [];
        let current = outlet.length;
        while (current-- > 0) {
            const target = fragmentHtml.querySelector(outlet[current]);
            if (target) {
                targetHTML[targetHTML.length] = target.outerHTML;
            }
        }
        html = targetHTML.join('');
    } else {
        html = fragmentHtml.outerHTML;
    }

    return {
        fragmentHtml,
        title,
        styles,
        scripts,
        html
    }
}

function render(dom: DashDOM, fragmentHtml?: HTMLElement) {
    if (!fragmentHtml) {
        const fragment = document.createDocumentFragment();
        fragmentHtml = document.createElement('html');
        fragment.appendChild(fragmentHtml);
    }

    const {title, styles, scripts, html} = dom;

    if (title) {
        document.title = title;
    }

    fragmentHtml.innerHTML = html;

    const {outlet} = CONFIGURE;

    if (outlet) {
        let current = outlet.length;
        while (current-- > 0) {
            const selector = outlet[current];
            const from = fragmentHtml.querySelector(selector);
            const to = BODY.querySelector(selector);

            if (from && to?.parentNode) {
                const parent = to.parentNode as HTMLElement;
                parent.replaceChild(from, to);
            }
        }
    } else {
        BODY.innerHTML = '';
        BODY.append(...(
            fragmentHtml.getElementsByTagName('BODY')[0]
            || fragmentHtml).children
        );
    }


    const {loadStyle, loadScript} = dash;
    const elements = [];
    const onLoads = [Promise.resolve()];

    let end: number;
    let current: number;

    const removeStyles: Children<HTMLLinkElement> = [];
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
        .catch(reason => console.warn(reason));
}

function onLoaded(outlet = BODY) {
    // console.debug('[dash] Loaded');
    LOADED = true;

    const store = DOM[CURRENT_PATH];

    const callbacks = GLOBAL_RUN.concat(store.run);

    const end = callbacks.length;
    let current = -1;

    while (++current < end) {
        callbacks[current](outlet);
    }
}

function seriesReduceFunction(promise: Promise<void>, callback: voidPromiseCallback) {
    return promise.then(() => {
        return callback();
    });
}

function promiseMapFunction(callback: voidPromiseCallback) {
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
        const {href} = anchor;
        if (!href.startsWith(ORIGIN) || anchor.download) {
            node._dashAnchor = false;
            return true;
        }

        node._dashAnchor = anchor;
        node = anchor;
    }

    dash.route(node.href);

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

addEventListener('DOMContentLoaded', onLoad);
addEventListener('popstate', onPopstate);
addEventListener('click', bodyOnClick);

export default dash;
