## Missing features

- animations/gestures
  - rubber-band on over-drag
  - spring animations
- other
  - max, min zoom
  - fit, resize, crop, center
- fancy
  - minimap
  - zoom to object
  - full-screen
- HTML custom element

## UX

### Interaction

| intention | keyboard                   | mouse            | trackpad/touchpad       | touchscren          |
| --------- | -------------------------- | ---------------- | ----------------------- | ------------------- |
| scrool    | <kbd>↑</kbd>, <kbd>↓</kbd> | (3) wheel        | (5) two finger drag     | (6) one finger drag |
| pan       | (1)                        | left clik + move | one finger click + move | two finger drag     |
| zoom      | (2)                        | (4)              | pinch                   | pinch               |
| reset     | (7)                        | double click     | double click            | double tap          |

Options:

- 1, 2, 4, 7 - we can add buttons (like in GiiHub screenshot above)
- 1 - focus + <kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>←</kbd>, <kbd>→</kbd>
- 2 - focus + <kbd>+</kbd>, <kbd>-</kbd>
- 4 - <kbd>Ctrl</kbd> + wheel
- 7 - <kbd>Esc</kbd>

Notes:

- 3, 5 - I don't want to use wheel (mouse) or two finger drag (trackpad) for zoom to avoid problem with scroll trap.
- 6 - I don't want to use one finger drag (touchscreen) for pan. Instead, when people would use one finger drag over SVG, it would show overlay which instructs people to use two fingers

## Implementation

### Transformation

- [svg `viewBox`](https://css-tricks.com/creating-a-panning-effect-for-svg/)
- [root element `transform`](https://www.petercollingridge.co.uk/tutorials/svg/interactive/pan-and-zoom/)
- [`position: relative` and `CSS transform`](https://stackblitz.com/edit/multi-touch-trackpad-gesture?file=index.js)
  - see also [use-gesture example](https://codesandbox.io/p/sandbox/github/pmndrs/use-gesture/tree/main/demo/src/sandboxes/card-zoom?file=%2Fsrc%2FApp.tsx%3A22%2C10-22%2C15)

### Matrix

- [Affine matrix](https://upload.wikimedia.org/wikipedia/commons/2/2c/2D_affine_transformation_matrix.svg)
- [transform matrix](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix)
- [DOMMatrix](https://developer.mozilla.org/en-US/docs/Web/API/DOMMatrix)
