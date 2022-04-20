"use strict";
/// <reference path="singular.ts" />
(function (singular) {
    const { fromCharCode: FROM_CHAR_CODE } = String;
    const { parse: PARSE, stringify: STRINGIFY } = JSON;
    function toBinary(value) {
        const units = new Uint16Array(value.length);
        let current = units.length;
        while (current-- > 0) {
            units[current] = value.charCodeAt(current);
        }
        const codes = new Uint8Array(units.buffer);
        const end = codes.length;
        let result = '';
        current = -1;
        while (++current < end) {
            result += FROM_CHAR_CODE(codes[current]);
        }
        return result;
    }
    function fromBinary(value) {
        const bytes = new Uint8Array(value.length);
        let current = bytes.length;
        while (current-- > 0) {
            bytes[current] = value.charCodeAt(current);
        }
        const codes = new Uint16Array(bytes.buffer);
        const end = codes.length;
        let result = '';
        current = -1;
        while (++current < end) {
            result += FROM_CHAR_CODE(codes[current]);
        }
        return result;
    }
    function reverse(value) {
        let result = '';
        let current = value.length;
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
        const value = sessionStorage.getItem(getKey(name));
        return value ?
            PARSE(fromBinary(atob(reverse(atob(value))))) :
            value;
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
