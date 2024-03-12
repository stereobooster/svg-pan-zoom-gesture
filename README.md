# svg-pan-zoom

[![Netlify Status](https://api.netlify.com/api/v1/badges/4bdb3997-ed5f-4506-bb77-95595d2e6562/deploy-status)](https://app.netlify.com/sites/svg-pan-zoom/deploys)

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
- all actions are available through gestures, so it works without UI

## Demo

https://svg-pan-zoom.stereobooster.com/

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
import { SvgPanZoomUi } from "@stereobooster/svg-pan-zoom";

document.querySelectorAll(".svg-pan-zoom").forEach((container) => {
  const element = container.querySelector("svg,img");
  if (!element) return;
  new SvgPanZoomUi({ element, container }).on();
});
```

Additionally, CSS to style UI required:

```css
.svg-pan-zoom .buttons {
}
.svg-pan-zoom .zoom-in {
}
.svg-pan-zoom .reset {
}
.svg-pan-zoom .zoom-out {
}

.svg-pan-zoom {
  position: relative;
}

.svg-pan-zoom .buttons {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  opacity: 0;
  transition-property: opacity;
  transition-duration: 300ms;
}

.svg-pan-zoom:hover .buttons {
  opacity: 1;
}

@media (hover: none) {
  .svg-pan-zoom .buttons {
    display: none;
  }
}

.touchscreen-warning {
  position: absolute;
  right: 0rem;
  bottom: 0rem;
  left: 0rem;
  top: 0rem;
  pointer-events: none;
  display: none;
  opacity: 0;
  transition-property: opacity;
  transition-duration: 300ms;
}

.touchscreen-warning.active {
  opacity: 1;
}

@media (hover: none) {
  .touchscreen-warning {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 3rem;
    text-align: center;
    padding: 1rem;
  }
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
