interface dash {
    session: {
        get: (name: string) => any,
        set: (name: string, value: any) => dash,
        clear: () => dash
    }
}

(function (dash) {
    const {fromCharCode: FROM_CHAR_CODE} = String;
    const {parse: PARSE, stringify: STRINGIFY} = JSON;

    function toBinary(value: string) {
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

    function fromBinary(value: string) {
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

    function reverse(value: string) {
        let result = '';
        let current = value.length;
        while (current-- > 0) {
            result += value[current];
        }
        return result;
    }

    function getKey(value: string) {
        return btoa(
            reverse(
                btoa(value)
            )
        )
    }

    function setSession(name: string, value: any) {
        sessionStorage.setItem(
            getKey(name),
            btoa(
                reverse(
                    btoa(
                        toBinary(
                            STRINGIFY(value)
                        )
                    )
                )
            )
        );

        return dash;
    }

    function getSession(name: string) {
        const value = sessionStorage.getItem(getKey(name));

        return value ?
            PARSE(
                fromBinary(
                    atob(
                        reverse(
                            atob(value)
                        )
                    )
                )
            ) :
            value
    }

    function popSession(name: string){
        sessionStorage.removeItem(getKey(name));
        return dash
    }

    function clearSession() {
        sessionStorage.clear();
        return dash;
    }

    dash.session = {
        get: getSession,
        set: setSession,
        pop: popSession,
        clear: clearSession
    };

})(window['dash' as any] as any);
