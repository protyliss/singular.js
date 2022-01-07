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
declare type VoidPromiseCallback = (...args: any) => Promise<void>;
declare type ChangedElementCallback = (changedElement: HTMLElement) => void;
/**
 * @alias dash.enter
 * @param callback
 */
declare function dash(callback: VoidPromiseCallback): typeof dash;
declare namespace dash {
    var configure: <T extends Partial<DashConfigure>>(configure: T) => typeof dash;
    var series: (callback: VoidPromiseCallback) => typeof dash;
    var parallel: (callback: VoidPromiseCallback) => typeof dash;
    var addStyle: (href: string) => {
        link: HTMLLinkElement;
        promise: Promise<void>;
    };
    var addScript: (src: string, async?: boolean) => {
        script: HTMLScriptElement;
        promise: Promise<void>;
    };
    var ready: (callback: ChangedElementCallback) => typeof dash;
    var load: (callback: ChangedElementCallback) => typeof dash;
    var unload: (callback: Function) => typeof dash;
    var enter: (callback: ChangedElementCallback) => typeof dash;
    var exit: (callback: Function) => typeof dash;
    var route: (href: string, htmlSelectors?: string[] | undefined) => null | undefined;
    var changed: (target?: HTMLElement) => typeof dash;
}
export default dash;
