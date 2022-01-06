interface dash {
    activeLink(selector: string): dash;
}

(function (dash) {
    const ORIGIN_LENGTH = location.origin.length;
    let ACTIVATED_LINKS: HTMLElement[] = [];

    dash.activeLink = function (selector: string) {
        return dash
            .load(() => {
                activeLinks(selector)
            })
            .unload(inactiveLinks);
    }

    function activeLinks(selector: string) {
        const containers = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
        let current = containers.length;
        while (current-- > 0) {
            activeLink(containers[current]);
        }
    }

    function inactiveLinks() {
        const anchors = ACTIVATED_LINKS;
        let current = anchors.length;
        while (current-- > 0) {
            anchors[current].classList.remove('_active');
        }

        ACTIVATED_LINKS = [];
    }


    function activeLink(container: HTMLElement) {
        const currentPath = location.href.substring(ORIGIN_LENGTH);

        const anchors = container.getElementsByTagName('A') as any as HTMLAnchorElement[];
        let current = anchors.length;
        while (current-- > 0) {
            let anchor = anchors[current];

            if (currentPath !== anchor.href.substring(ORIGIN_LENGTH)) {
                continue;
            }

            activate(anchor);
            anchor.focus();
            anchor.blur();

            do {
                let ul = anchor.closest('ul')
                if (ul) {
                    const li = ul.closest('li');
                    if (li) {
                        anchor = li.getElementsByTagName('A')[0] as HTMLAnchorElement;
                        if (anchor) {
                            activate(anchor);
                            continue;
                        }
                    }
                }
                break;
            } while (anchor);
        }
    }

    function activate(anchor: HTMLElement) {
        ACTIVATED_LINKS[ACTIVATED_LINKS.length] = anchor;
        anchor.classList.add('_active');
    }

})(window['dash' as any] as any)
