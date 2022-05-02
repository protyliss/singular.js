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
    disableTitleChange: boolean;
}
declare type VoidPromiseCallback = (...args: any) => Promise<void>;
declare type ChangedElementCallback = (changedElements: ChangedElements) => void;
declare class ChangedElements extends Array<Element> {
    #private;
    constructor(changedElements: Element[]);
    getElementById(elementId: string): HTMLElement | null;
    getElementsByTagName<K extends keyof HTMLElementTagNameMap>(qualifiedName: K): HTMLElementTagNameMap[K][];
    getElementsByTagName<K extends keyof SVGElementTagNameMap>(qualifiedName: K): SVGElementTagNameMap[K][];
    getElementsByClassName(classNames: string): Element[];
    querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K];
    querySelector<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K];
    querySelectorAll<E extends Element = Element>(selectors: keyof HTMLElementTagNameMap | string): E[];
}
export declare const chaining: {
    configure: typeof configure;
    series: typeof series;
    parallel: typeof parallel;
    ready: typeof ready;
    load: typeof load;
    enter: typeof enter;
    exit: typeof exit;
    unload: typeof unload;
    changed: typeof changed;
};
/**
 * Set Configure
 * @param values
 */
export declare function configure(values: Partial<SingularConfigure>): {
    configure: typeof configure;
    series: typeof series;
    parallel: typeof parallel;
    ready: typeof ready;
    load: typeof load;
    enter: typeof enter;
    exit: typeof exit;
    unload: typeof unload;
    changed: typeof changed;
};
/**
 * Add External Stylesheet to <HEAD> Using <LINK>
 * @param href
 */
export declare function addStyle(href: string): {
    link: HTMLLinkElement;
    promise: Promise<void>;
};
/**
 *  Add External Stylesheet to <HEAD> Using <SCRIPT>
 * @param src
 * @param async
 */
export declare function addScript(src: string, async?: boolean): {
    script: HTMLScriptElement;
    promise: Promise<void>;
};
/**
 * Set Parallel Callback for Bootstrap
 * @description
 *   Callbacks Call as Multiple Thread
 * @param callback
 */
export declare function parallel(callback: VoidPromiseCallback): {
    configure: typeof configure;
    series: typeof series;
    parallel: typeof parallel;
    ready: typeof ready;
    load: typeof load;
    enter: typeof enter;
    exit: typeof exit;
    unload: typeof unload;
    changed: typeof changed;
};
/**
 * Set Series Callback for Bootstrap
 * @description
 *   Callbacks Call as Single Thread
 *   If Previous Callback to failed, Does not Move to Next Callback.
 * @param callback
 */
export declare function series(callback: VoidPromiseCallback): {
    configure: typeof configure;
    series: typeof series;
    parallel: typeof parallel;
    ready: typeof ready;
    load: typeof load;
    enter: typeof enter;
    exit: typeof exit;
    unload: typeof unload;
    changed: typeof changed;
};
/**
 * Run Once in Declared Document after DOMContentLoaded
 * @param callback
 */
export declare function ready(callback: ChangedElementCallback): {
    configure: typeof configure;
    series: typeof series;
    parallel: typeof parallel;
    ready: typeof ready;
    load: typeof load;
    enter: typeof enter;
    exit: typeof exit;
    unload: typeof unload;
    changed: typeof changed;
};
/**
 * Run Everytime in Every Document after DOMContentLoaded
 * @param callback
 */
export declare function load(callback: ChangedElementCallback): {
    configure: typeof configure;
    series: typeof series;
    parallel: typeof parallel;
    ready: typeof ready;
    load: typeof load;
    enter: typeof enter;
    exit: typeof exit;
    unload: typeof unload;
    changed: typeof changed;
};
/**
 * Run Everytime in Declared Document after DOMContentLoaded
 * @alias singular
 * @param callback
 */
export declare function enter(callback: ChangedElementCallback): {
    configure: typeof configure;
    series: typeof series;
    parallel: typeof parallel;
    ready: typeof ready;
    load: typeof load;
    enter: typeof enter;
    exit: typeof exit;
    unload: typeof unload;
    changed: typeof changed;
};
/**
 * Run Everytime in Declared Document after beforeunload
 * @param callback
 */
export declare function exit(callback: Function): {
    configure: typeof configure;
    series: typeof series;
    parallel: typeof parallel;
    ready: typeof ready;
    load: typeof load;
    enter: typeof enter;
    exit: typeof exit;
    unload: typeof unload;
    changed: typeof changed;
};
export declare function unload(callback: Function): {
    configure: typeof configure;
    series: typeof series;
    parallel: typeof parallel;
    ready: typeof ready;
    load: typeof load;
    enter: typeof enter;
    exit: typeof exit;
    unload: typeof unload;
    changed: typeof changed;
};
/**
 * Move to Other Document
 * @param requestUrl
 * @param outletSelectors
 */
export declare function route(requestUrl: string, outletSelectors?: string): null | undefined;
/**
 * Signal for DOM Changed by any codes
 * @param changedElements
 */
export declare function changed(changedElements?: Element[]): {
    configure: typeof configure;
    series: typeof series;
    parallel: typeof parallel;
    ready: typeof ready;
    load: typeof load;
    enter: typeof enter;
    exit: typeof exit;
    unload: typeof unload;
    changed: typeof changed;
};
export {};
