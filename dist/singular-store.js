"use strict"; /// <reference path="singular.ts" />

(function (singular) {
  var FROM_CHAR_CODE = String.fromCharCode;
  var PARSE = JSON.parse,
      STRINGIFY = JSON.stringify;

  function toBinary(value) {
    var units = new Uint16Array(value.length);
    var current = units.length;

    while (current-- > 0) {
      units[current] = value.charCodeAt(current);
    }

    var codes = new Uint8Array(units.buffer);
    var end = codes.length;
    var result = '';
    current = -1;

    while (++current < end) {
      result += FROM_CHAR_CODE(codes[current]);
    }

    return result;
  }

  function fromBinary(value) {
    var bytes = new Uint8Array(value.length);
    var current = bytes.length;

    while (current-- > 0) {
      bytes[current] = value.charCodeAt(current);
    }

    var codes = new Uint16Array(bytes.buffer);
    var end = codes.length;
    var result = '';
    current = -1;

    while (++current < end) {
      result += FROM_CHAR_CODE(codes[current]);
    }

    return result;
  }

  function reverse(value) {
    var result = '';
    var current = value.length;

    while (current-- > 0) {
      result += value[current];
    }

    return result;
  }

  function getKey(value) {
    return btoa(reverse(btoa(value)));
  }

  function setSession(name, value) {
    sessionStorage.setItem(getKey(name), btoa(reverse(btoa(toBinary(STRINGIFY(value))))));
    return singular;
  }

  function getSession(name) {
    var value = sessionStorage.getItem(getKey(name));
    return value ? PARSE(fromBinary(atob(reverse(atob(value))))) : value;
  }

  function popSession(name) {
    sessionStorage.removeItem(getKey(name));
    return singular;
  }

  function clearSession() {
    sessionStorage.clear();
    return singular;
  }

  singular.session = {
    get: getSession,
    set: setSession,
    pop: popSession,
    clear: clearSession
  };
})(window['singular']);
//# sourceMappingURL=singular-store.js.map
