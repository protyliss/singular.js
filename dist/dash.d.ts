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
declare function dash(callback: VoidPromiseCallback): typeof dash;
declare namespace dash {
    var configure: <T extends Partial<DashConfigure>>(configure: T) => typeof dash;
    var load: (callback: VoidPromiseCallback) => typeof dash;
    var loadParallel: (callback: VoidPromiseCallback) => typeof dash;
    var loadStyle: (href: string) => {
        link: HTMLLinkElement;
        promise: Promise<void>;
    };
    var loadScript: (src: string, async?: boolean) => {
        script: HTMLScriptElement;
        promise: Promise<void>;
    };
    var run: (callback: ChangedElementCallback) => typeof dash;
    var runEvery: (callback: ChangedElementCallback) => typeof dash;
    var route: (href: string, htmlSelectors?: string[] | undefined) => null | undefined;
    var changed: (target?: HTMLElement) => typeof dash;
}
export default dash;
