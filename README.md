# svg-pan-zoom

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="logo/logo-dark.svg">
    <img alt="" src="logo/logo.svg" width="200" height="200">
  </picture>
</p>

Small JS library to add **pan and zoom** functionality to **SVG** (inline or image). It supports **gestures** for all types of devices:

| intention | mouse                   | trackpad/touchpad | touchscren      |
| --------- | ----------------------- | ----------------- | --------------- |
| pan       | clik + move             | click + move      | two finger drag |
| zoom      | <kbd>Ctrl</kbd> + wheel | pinch             | pinch           |
| reset     | double click            | double click      | double tap      |
|           |                         |                   |                 |
| scroll    | wheel                   | two finger drag   | one finger drag |

Pay attention:

- gestures intentionally selected to not interfere with the system's default scroll gestures, **to avoid "scroll traps"**
- all actions are available through gestures, so it works without UI. You can add UI, though. Library exposes methods for this, like `pan(dx, dy)` and `zoom(scale)`

## Demo

[![Netlify Status](https://api.netlify.com/api/v1/badges/4bdb3997-ed5f-4506-bb77-95595d2e6562/deploy-status)](https://app.netlify.com/sites/svg-pan-zoom/deploys)

[svg-pan-zoom demo](https://svg-pan-zoom.stereobooster.com/)

## Usage

There are two flavors:

- Headless - without UI
- Default UI

### Headless

```ts
import { SvgPanZoom } from "@stereobooster/svg-pan-zoom";

document.querySelectorAll(".svg-pan-zoom").forEach((container) => {
  const element = container.querySelector("svg,img");
  if (!element) return;
  new SvgPanZoom({ element, container }).on();
});
```

Additionally following CSS is required:

```css
.svg-pan-zoom {
  overflow: hidden;
  touch-action: pan-x pan-y;
  user-select: none;
  cursor: grab;
}

.svg-pan-zoom svg,
.svg-pan-zoom img {
  pointer-events: none;
  /* need to center smaller images */
  margin: auto;
  /* need to fit bigger images */
  max-width: 100%;
  height: auto;
}
```

Instance methods:

- `on()` - adds event listeners
- `off()` - removes event listeners
- `pan(dx, dy)` - pans image
- `zoom(scale)` - zooms image
- `reset()` - resets pan and zoom values

### Default UI

```ts
import "@stereobooster/svg-pan-zoom/css/SvgPanZoomUi.css";
import { SvgPanZoomUi } from "@stereobooster/svg-pan-zoom";

document.querySelectorAll(".svg-pan-zoom").forEach((container) => {
  const element = container.querySelector("svg,img");
  if (!element) return;
  new SvgPanZoomUi({ element, container }).on();
});
```

Additionally, CSS to style UI required (for example with Tailwind):

```css
.svg-pan-zoom .buttons {
  @apply inline-flex;
}
.svg-pan-zoom .zoom-in {
  @apply bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l;
}
.svg-pan-zoom .reset {
  @apply bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4;
}
.svg-pan-zoom .zoom-out {
  @apply bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r;
}
```

You can configure HTML classes used by UI:

```ts
const classes = {
  zoomIn: "zoom-in",
  reset: "reset",
  zoomOut: "zoom-out",
  buttons: "buttons",
  tsWarning: "touchscreen-warning",
  tsWarningActive: "active",
};

new SvgPanZoomUi({ element, container, classes });
```

and message with instructions for the touchscreen:

```ts
const message = "Use two fingers to pan and zoom";

new SvgPanZoomUi({ element, container, message });
```

## Pixelation in Safari

Be aware that some CSS will cause pixelation of SVG on zoom (bug in Safari), for example:

- `will-change: transform;`
- `transform: matrix3d(...);`
- `transition-property: transform;` (it setles after animation, though)

## Alternatives

There are a lot of solutions for this task:

- https://github.com/bumbu/svg-pan-zoom
- https://jillix.github.io/svg.pan-zoom.js/
- https://github.com/anvaka/panzoom
- https://www.npmjs.com/package/svg-pan-zoom-container
- https://svgjs.dev/docs/3.0/plugins/svg-panzoom-js/
- https://www.npmjs.com/package/react-svg-pan-zoom
- https://timmywil.com/panzoom/
- https://www.jqueryscript.net/other/SVG-Pan-Zoom-jQuery-SVGPanZoom.html
- https://www.d3indepth.com/zoom-and-pan/
- https://www.npmjs.com/package/react-zoom-pan-pinch

## Logo

spread by Tomas Knopp from <a href="https://thenounproject.com/browse/icons/term/spread/" target="_blank" title="spread Icons">Noun Project</a> (CC BY 3.0)
