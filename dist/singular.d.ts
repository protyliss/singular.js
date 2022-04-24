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
     * @description
     *  - null | 'body': Change all Children of BODY
     *  - '#id': Change Single Element
     *  - ['#id1' '#id2']: Change Multiple Elements
     */
    outletSelectors: undefined | null | string | string[];
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
declare type SingularAnchor = HTMLAnchorElement & {
    _singularAnchor?: false | HTMLAnchorElement;
};
declare type Child<T = HTMLElement> = T & {
    parentNode: HTMLElement;
};
declare type Children<T> = Array<Child<T>>;
declare type ChangedElementCallback = (changedElement: HTMLElement) => void;
declare const singular: {
    new (): {};
    /**
     * Set Configure
     * @param configure
     */
    configure(configure: Partial<SingularConfigure>): any;
    /**
     * Add External Stylesheet to <HEAD> Using <LINK>
     * @param href
     */
    addStyle(href: string): {
        link: HTMLLinkElement;
        promise: Promise<void>;
    };
    /**
     *  Add External Stylesheet to <HEAD> Using <SCRIPT>
     * @param src
     * @param async
     */
    addScript(src: string, async?: boolean): {
        script: HTMLScriptElement;
        promise: Promise<void>;
    };
    /**
     * Set Parallel Callback for Bootstrap
     * @description
     *   Callbacks Call as Multiple Thread
     * @param callback
     */
    parallel(callback: VoidPromiseCallback): any;
    /**
     * Set Series Callback for Bootstrap
     * @description
     *   Callbacks Call as Single Thread
     *   If Previous Callback to failed, Does not Move to Next Callback.
     * @param callback
     */
    series(callback: VoidPromiseCallback): any;
    /**
     * Run Once in Declared Document after DOMContentLoaded
     * @param callback
     */
    ready(callback: ChangedElementCallback): any;
    /**
     * Run Everytime in Every Document after DOMContentLoaded
     * @param callback
     */
    load(callback: ChangedElementCallback): any;
    /**
     * Run Everytime in Declared Document after DOMContentLoaded
     * @alias singular
     * @param callback
     */
    enter(callback: ChangedElementCallback): any;
    /**
     * Run Everytime in Declared Document after beforeunload
     * @param callback
     */
    exit(callback: Function): any;
    unload(callback: Function): any;
    /**
     * Move to Other Document
     * @param requestUrl
     * @param outletSelectors
     */
    route(requestUrl: string, outletSelectors?: string[] | undefined): null | undefined;
    /**
     * Signal for DOM Changed by any codes
     * @param target
     */
    changed(target?: HTMLElement): any;
};
