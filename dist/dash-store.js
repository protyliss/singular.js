"use strict";!function(n){var i=String.fromCharCode,t=JSON.parse,e=JSON.stringify;function o(r){for(var t="",n=r.length;0<n--;)t+=r[n];return t}function a(r){return btoa(o(btoa(r)))}n.session={get:function(r){return(r=sessionStorage.getItem(a(r)))&&t(function(r){for(var t=new Uint8Array(r.length),n=t.length;0<n--;)t[n]=r.charCodeAt(n);for(var e=new Uint16Array(t.buffer),o=e.length,a="",n=-1;++n<o;)a+=i(e[n]);return a}(atob(o(atob(r)))))},set:function(r,t){return sessionStorage.setItem(a(r),btoa(o(btoa(function(r){for(var t=new Uint16Array(r.length),n=t.length;0<n--;)t[n]=r.charCodeAt(n);for(var e=new Uint8Array(t.buffer),o=e.length,a="",n=-1;++n<o;)a+=i(e[n]);return a}(e(t)))))),n},pop:function(r){return sessionStorage.removeItem(a(r)),n},clear:function(){return sessionStorage.clear(),n}}}(window.dash);
//# sourceMappingURL=dash-store.js.map
