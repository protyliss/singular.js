interface DashConfigure {
    outlet: undefined | null | string[];
}
declare type voidPromiseCallback = (...args: any) => Promise<void>;
declare function dash(callback: voidPromiseCallback): typeof dash;
declare namespace dash {
    var configure: (configure: Partial<DashConfigure>) => typeof dash;
    var load: (callback: voidPromiseCallback) => typeof dash;
    var loadParallel: (callback: voidPromiseCallback) => typeof dash;
    var loadStyle: (href: string) => {
        link: HTMLLinkElement;
        promise: Promise<void>;
    };
    var loadScript: (src: string, async?: boolean) => {
        script: HTMLScriptElement;
        promise: Promise<void>;
    };
    var run: (callback: Function) => typeof dash;
    var runEvery: (callback: Function) => typeof dash;
    var route: (href: string, outlet?: null) => null | undefined;
    var changed: (target?: HTMLElement) => typeof dash;
}
export default dash;
