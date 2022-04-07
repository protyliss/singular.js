"use strict";function _toConsumableArray(e){return _arrayWithoutHoles(e)||_iterableToArray(e)||_unsupportedIterableToArray(e)||_nonIterableSpread()}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _iterableToArray(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}function _arrayWithoutHoles(e){if(Array.isArray(e))return _arrayLikeToArray(e)}function _slicedToArray(e,r){return _arrayWithHoles(e)||_iterableToArrayLimit(e,r)||_unsupportedIterableToArray(e,r)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(e,r){if(e){if("string"==typeof e)return _arrayLikeToArray(e,r);var t=Object.prototype.toString.call(e).slice(8,-1);return"Map"===(t="Object"===t&&e.constructor?e.constructor.name:t)||"Set"===t?Array.from(e):"Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?_arrayLikeToArray(e,r):void 0}}function _arrayLikeToArray(e,r){(null==r||r>e.length)&&(r=e.length);for(var t=0,n=new Array(r);t<r;t++)n[t]=e[t];return n}function _iterableToArrayLimit(e,r){var t=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=t){var n,a,l=[],o=!0,i=!1;try{for(t=t.call(e);!(o=(n=t.next()).done)&&(l.push(n.value),!r||l.length!==r);o=!0);}catch(e){i=!0,a=e}finally{try{o||null==t.return||t.return()}finally{if(i)throw a}}return l}}function _arrayWithHoles(e){if(Array.isArray(e))return e}function _defineProperties(e,r){for(var t=0;t<r.length;t++){var n=r[t];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function _createClass(e,r,t){return r&&_defineProperties(e.prototype,r),t&&_defineProperties(e,t),Object.defineProperty(e,"prototype",{writable:!1}),e}function _classCallCheck(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")}function _defineProperty(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}var singular=function(_,x,l){var A,e=location,T=e.href,c=e.origin,f=Array.from,o=[],i=[],S=[],M={development:!1,elementIds:null,classSelectors:null,enableKeepHtml:!1,enableKeepStyles:!1,enableSearchString:!1,enableHashString:!1},w=x.documentElement.outerHTML,a=[],s=[],B={},D={},C=!1,P=T,k=_createClass(function e(){_classCallCheck(this,e),_defineProperty(this,"url",void 0),_defineProperty(this,"title",void 0),_defineProperty(this,"styles",void 0),_defineProperty(this,"scripts",void 0),_defineProperty(this,"enterCallbacks",[]),_defineProperty(this,"exitCallbacks",[]),_defineProperty(this,"classes",void 0),_defineProperty(this,"html",void 0)}),I=_createClass(function e(r){_classCallCheck(this,e),_defineProperty(this,"singular",void 0),this.singular={href:r}}),L=_defineProperty({},T,new k);function u(e){return x.createElement(e)}function R(e){var r=x.createDocumentFragment(),t=u("html");return r.appendChild(t),t.innerHTML=e,t}function q(e){return q.enter(e)}function E(e,r){for(var t=N(x.documentElement),n=t.entries,a=t.urls,l=W(x.documentElement),o=l.entries,t=l.urls,i=n.length,s=-1;++s>i;){var u=_slicedToArray(n[s],2),c=u[0],u=u[1];B[u]=c}for(i=o.length,s=-1;++s<i;){var f=_slicedToArray(o[s],2),h=f[0],f=f[1];D[f]=h,x.head.append(h)}l=L[H(T)];l.url=T,l.title=x.title,l.styles=a,l.scripts=t,l.html=w,w=null;for(var d=x.links,s=d.length;0<s--;){var y=d[s],p=y.getAttribute("href");p&&(p.startsWith("./")||p.startsWith("../"))&&y.setAttribute("href",y.href)}return(E=function(t,n){if(C){var e=L[P].exitCallbacks.concat(S),r=e.length,a=-1;try{for(;++a<r;)e[a]()}catch(e){console.warn(e)}}else A&&A.abort();_.scrollTo(0,0),C=!1,P=H(t);var l=L[P];l?M.enableKeepHtml?(O(l),b(l.url)):g(t).then(function(e){e=_slicedToArray(e,2),e[0],e=e[1];l.html=e,O(l)}):g(t).then(function(e){var r=_slicedToArray(e,2),e=r[0],r=r[1];!function(e,r,t,n){var a,l=R(t),o=(l.getElementsByTagName("TITLE")[0]||{}).innerText||e,i=M.classSelectors,s=null;if(i)for(s={},a=i.length;0<a--;){var u=i[a];s[u]=(l.getElementsByTagName(u)[0]||{}).className||""}var c=N(l).urls,t=W(l),f=t.entries,e=t.urls;a=f.length;for(;0<a--;){var h=_slicedToArray(f[a],1)[0];null!=h&&h.parentNode&&h.parentNode.removeChild(h)}if(n){for(var d=[],y=n.length;0<y--;){var p=l.querySelector("#"+n[y]);p&&(d[d.length]=p.outerHTML)}g=d.join("")}else g=l.outerHTML;t=new k;t.url=r,t.title=o,t.styles=c,t.scripts=e,t.classes=s,t.html=g;var g=new URL(P);g.pathname.endsWith("/")&&(g.pathname=g.pathname.substring(0,g.pathname.length-1));O(L[""+g]=t)}(t,e,r,n||M.elementIds)})}).apply(this,arguments);function g(e){return A=new AbortController,fetch(e,{signal:A.signal}).then(m).catch(v)}function m(e){var r=e.url;return b(r),Promise.all([Promise.resolve(r),e.text()])}function v(e){console.warn(e)}function b(e){history.pushState(new I(e),e,e)}}function H(e){var r=new URL(e);M.enableHashString||(r.hash=""),M.enableSearchString||(r.search="");e=r.pathname;return e.endsWith("/")&&(r.pathname=e.substring(0,e.length-1)),""+r}function O(e){var r=e.url,t=e.title,n=e.styles,a=e.scripts,l=e.classes,o=e.html,e=M,i=e.elementIds,s=e.classSelectors;if(x.title=t||r.substring(r.indexOf("://")+3),s&&l)for(var u=s.length;0<u--;){var c=s[u],f=x.documentElement.querySelector(c);f&&(f.className=l[c])}var h=R(o),d=!1;if(i){for(var y=[],p=i.length;0<p--;){var g=i[p],m=h.querySelector("#"+g),g=x.getElementById(g);if(!m||!g){d=!0;break}y[y.length]=[m,g]}if(!d)for(p=y.length;0<p--;){var v=_slicedToArray(y[p],2),b=v[0],v=v[1];v.parentNode.replaceChild(b,v)}}else d=!0;d&&(x.body.innerHTML="",(A=x.body).append.apply(A,_toConsumableArray((h.getElementsByTagName("BODY")[0]||h).children))),h.innerHTML="";var _,A,T=q.addScript,S=q.addStyle,w=[],C=[Promise.resolve()],P=[];if(!M.enableKeepStyles)for(var k=Object.keys(B),I=k.length;0<I--;){var L=k[I];-1<n.indexOf(L)||(P[P.length]=B[L],delete B[L])}for(_=n.length,I=-1;++I<_;){var E,H,O=n[I];B[O]||(E=(H=S(O)).link,H=H.promise,B[O]=E,C[C.length]=H,w[w.length]=E)}for(_=a.length,I=-1;++I<_;){var N,W,j=a[I];null!==(N=D[j])&&void 0!==N&&N.parentNode||(N=(W=T(j)).script,W=W.promise,D[j]=N,C[C.length]=W,w[w.length]=N)}w.length&&(A=x.head).append.apply(A,w),Promise.all(C).then(function(){for(var e=P.length;0<e--;){var r=P[e];r&&r.parentNode&&r.parentNode.removeChild(r)}K()})}function r(e,r,t){for(var n=[],a=[],l=f(e.querySelectorAll(r)),o=l.length,i=-1;++i<o;){var s,u=l[i];u.getAttribute(t)&&!u[t].startsWith(c)&&(s=""+new URL(u.getAttribute(t),location.href),n[n.length]=[u,s],a[a.length]=s)}return{entries:n,urls:a}}function N(e){return r(e,"link[rel=stylesheet]","href")}function W(e){return r(e,"script[src]","src")}function K(){for(var e=a.length,r=-1,t=Promise.resolve();++r<e;)!function(){var e=a[r];t=t.then(function(){return e()})}();for(var n=[t],r=s.length;0<r--;)n[n.length]=s[r]();a=[],s=[],Promise.all(n).then(h).catch(d)}function h(){x.documentElement.style.visibility="inherit";try{!function(){var e=0<arguments.length&&arguments[0]!==l?arguments[0]:x.body;C=!0;var r=L[P],t=[].concat(_toConsumableArray(o.splice(0,o.length)),i,_toConsumableArray(r.enterCallbacks)),n=t.length,a=-1;for(;++a<n;)t[a](e)}()}catch(e){console.warn(e)}}function d(e){console.warn(e),M.development||location.reload()}return q.configure=function(e){var r=e.elementIds,t=e.classSelectors;return r&&("string"==typeof r&&(e.elementIds=[r]),-1<r.indexOf("body")&&(e.elementIds=null)),t&&"string"==typeof t&&(e.classSelectors=[t]),M=Object.assign(M,e),q},q.series=function(e){return a[a.length]=e,q},q.parallel=function(e){return s[s.length]=e,q},q.addStyle=function(t){var n=u("link");return{link:n,promise:new Promise(function(e){function r(){return e()}n.onload=r,n.onerror=r,n.rel="stylesheet",x.head.append(n),n.href=t})}},q.addScript=function(t){var n=!(1<arguments.length&&arguments[1]!==l)||arguments[1],a=u("script");return{script:a,promise:new Promise(function(e){function r(){return e()}a.onload=r,a.onerror=r,a.async=n,x.head.append(a),a.src=t})}},q.ready=function(e){return o[o.length]=e,C&&e(x.body),q},q.load=function(e){return i[i.length]=e,C&&e(x.body),q},q.unload=function(e){return S[S.length]=e,q},q.enter=function(e){var r=L[P].enterCallbacks;return r[r.length]=e,C&&e(x.body),q},q.exit=function(e){var r=L[P].exitCallbacks;return r[r.length]=e,q},q.route=function(r,e){try{E(r,e)}catch(e){return console.warn(e),M.development||location.replace(r),null}},q.changed=function(){for(var e=0<arguments.length&&arguments[0]!==l?arguments[0]:x.body,r=i.length,t=-1;++t<r;)i[t](e);return q},addEventListener("click",function(e){var r=e.target;switch(r.tagName){case"BODY":return!1;case"A":break;default:if(!1===r._singularAnchor)return!0;var t=r.closest("a");if(!t||!t.href)return!(r._singularAnchor=!1);r=t}var n=r.href,a=r.getAttribute("href");if(!n.startsWith(c)||r.download||a&&a.startsWith("#"))return!(r._singularAnchor=!1);r._singularAnchor=r,e.stopPropagation(),e.preventDefault();e=null===(e=r.dataset)||void 0===e?void 0:e.outlet;return q.route(n,e?e.split(","):l),!1}),addEventListener("popstate",function(e){e=e.state;return e&&e.singular&&E(e.singular.href),!0}),addEventListener("DOMContentLoaded",function(){P=H(T),T!==P&&(L[P]=L[T],delete L[T]),x.documentElement.style.visibility="hidden",K()}),q}(window,document);
//# sourceMappingURL=singular.js.map
