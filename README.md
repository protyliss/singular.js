# Singular

Micro-framework as MPA[^mpa] transforms to SPA[^spa]

## Overview

Now days, Javascript-based SPA Frameworks are Very powerful and useful.
But, SPA Pattern is not a standard to makes every website.

Singular helps the MPA works like SPA.
that can have benefits of SPA.

* Change Content without __Redirect__ to target URL 
* Re-rendering only targeted elements[^optimize-rendering]
* HTTP Request only once
  * `html` files[^optimize-html] 
  * `css` files[^optimize-css]
  * `script` files

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

1. Move to `/foo`
   1. `/foo` ready()
   2. `/foo` load()
   3. `/foo` enter()
2. Move to `/bar`
   1. `/foo:1-3` exit()
   2. `/foo:1-2` unload()
   3. `/bar` ready()
   4. `/foo:1-2`, `/bar` load()
   5. `/bar` enter()
3. Move to `/baz`
   1. `/bar:2.5` exit()
   2. `/foo:1-2`, `/bar:2-4` unload()
   3. `/baz` ready()
   4. `/foo:1-2`, `/bar:2-4`, `/baz` load()
   5. `/baz` enter()
4. Move to `/foo`
   1. `/baz` exit()
   2. `/foo`, `/bar`, `/baz` unload()
   3. `/foo`, `/bar`, `/baz` load()
   4. `/foo` enter()
---

[^mpa]: Multiple Page Application

[^spa]: Single Page Application

[^optimize-rendering]: `outletSelectorelementIds` option is required.

[^optimize-html]: `enableKeepHtml` option is required.

[^optimize-css]: `enableKeepStyles` option is required.
