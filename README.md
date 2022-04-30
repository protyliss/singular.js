# Singular

Micro-framework as MPA[^mpa] transforms to SPA[^spa]

## Overview

Now days, Javascript-based SPA Framework are Very powerful and useful. But, It's not a standard to makes every
website.

Singular helps the MPA works like SPA.

* Change Content without Redirect to target URL
* Re-rendering only targeted elements[^optimize-rendering]
* HTTP Request only once
  * `html` files[^optimize-html] 
  * `css` files[^optimize-css]
  * `script` files

### Roadmap

* `load` and `enter` callback with exactly elements

---

## Migration

Just change the DOMContentLoaded-like Function to singular's Lifecycle Functions

### `DOMContentLoaded` Event

Before:

```js
window.addEventListener('DOMContentLoaded', callbackFunction)
```

After:

```js
singular.enter(callbackFunction);
```

### jQuery

Before:

```js
$(callbackFunction);
$.ready(callbackFunction);
```

After:

```js
singular.enter(callbackFunction);
```

---

### Lifecycle Functions

| Function            | Run at           | Document at | Runtime  |
|---------------------|------------------|-------------|:---------|
| singular.__ready__  | DOMContentLoaded | Origin URL  | Once     |
| singular.__load__   | DOMContentLoaded | Every URL   | Multiple |
| singular.__enter__  | DOMContentLoaded | Origin URL  | Multiple |
| singular.__exit__   | beforeunload     | Origin URL  | Multiple |
| singular.__unload__ | beforeunload     | Every URL   | Multiple |

---

[^mpa]: Multiple Page Application

[^spa]: Single Page Application

[^optimize-rendering]: `outletSelectorelementIds` option is required.

[^optimize-html]: `enableKeepHtml` option is required.

[^optimize-css]: `enableKeepStyles` option is required.
