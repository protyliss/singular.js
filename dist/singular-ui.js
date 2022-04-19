"use strict"; /// <reference path="singular.ts" />

(function (singular) {
  var ORIGIN_LENGTH = location.origin.length;
  var ACTIVATED_LINKS = [];

  singular.activeLink = function (selector) {
    return singular.load(function () {
      activeLinks(selector);
    }).unload(inactiveLinks);
  };

  function activeLinks(selector) {
    var containers = Array.from(document.querySelectorAll(selector));
    var current = containers.length;

    while (current-- > 0) {
      activeLink(containers[current]);
    }
  }

  function inactiveLinks() {
    var anchors = ACTIVATED_LINKS;
    var current = anchors.length;

    while (current-- > 0) {
      anchors[current].classList.remove('_active');
    }

    ACTIVATED_LINKS = [];
  }

  function activeLink(container) {
    var currentPath = location.href.substring(ORIGIN_LENGTH);
    var anchors = container.getElementsByTagName('A');
    var current = anchors.length;

    while (current-- > 0) {
      var anchor = anchors[current];

      if (currentPath !== anchor.href.substring(ORIGIN_LENGTH)) {
        continue;
      }

      activate(anchor);
      anchor.focus();
      anchor.blur();

      do {
        var ul = anchor.closest('ul');

        if (ul) {
          var li = ul.closest('li');

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
