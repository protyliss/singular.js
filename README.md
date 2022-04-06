# Singular

MPA[^mpa] transforms to SPA[^spa]

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

## Migration

Just change the DOMContentLoaded-like Function to singular

### `DOMContentLoaded` Event

Before:

```js
window.addEventListener('DOMContentLoaded', callbackFunction)
```

After:

```js
singular(callbackFunction);
```

### Jquery

Before:

```js
$(callbackFunction);
$.load(callbackFunction);
```

After:

```js
singular(callbackFunction);
```

---

### Callback Register Methods

| Method          | Run at           | Document at |
|-----------------|------------------|-------------|
| singular.ready  | DOMContentLoaded | Origin URL  |
| singular.load   | DOMContentLoaded | Every URL   |
| singular.enter  | DOMContentLoaded | Origin URL  |
| singular.exit   | beforeunload     | Origin URL  |
| singular.unload | beforeunload     | Every URL   |

> `singular` is alias of `singular.enter`

---

[^mpa]: Multiple Page Application

[^spa]: Single Page Application

[^optimize-rendering]: `htmlSelectors` option is required.

[^optimize-html]: `enableKeepHtml` option is required.

[^optimize-css]: `enableKeepStyles` option is required.
