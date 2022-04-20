"use strict";
/// <reference path="singular.ts" />
(function (singular) {
    const ORIGIN_LENGTH = location.origin.length;
    let ACTIVATED_LINKS = [];
    singular.activeLink = function (selector) {
        return singular
            .load(() => {
            activeLinks(selector);
        })
            .unload(inactiveLinks);
    };
    function activeLinks(selector) {
        const containers = Array.from(document.querySelectorAll(selector));
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
    function activeLink(container) {
        const currentPath = location.href.substring(ORIGIN_LENGTH);
        const anchors = container.getElementsByTagName('A');
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
                let ul = anchor.closest('ul');
                if (ul) {
                    const li = ul.closest('li');
                    if (li) {
                        anchor = li.getElementsByTagName('A')[0];
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
    function activate(anchor) {
        ACTIVATED_LINKS[ACTIVATED_LINKS.length] = anchor;
        anchor.classList.add('_active');
    }
})(window['singular']);

//# sourceMappingURL=singular-ui.js.map
