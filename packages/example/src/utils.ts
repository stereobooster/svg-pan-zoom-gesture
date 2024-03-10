import * as math from "mathjs";

export type Coords = Array<[number, number]>;

// this causes pixelation in Safari
// export function ttm(m: math.Matrix) {
//   return `matrix3d(${[
//     [m.get([0, 0]), m.get([1, 0]), 0, 0],
//     [m.get([0, 1]), m.get([1, 1]), 0, 0],
//     [0, 0, 1, 0],
//     [m.get([0, 2]), m.get([1, 2]), 0, 1],
//   ]})`;
// }

export function ttm(m: math.Matrix) {
  return `matrix(${[
    m.get([0, 0]),
    m.get([1, 0]),
    m.get([0, 1]),
    m.get([1, 1]),
    m.get([0, 2]),
    m.get([1, 2]),
  ]})`;
}

// maybe can use `matrixTransform()` from
// https://developer.mozilla.org/en-US/docs/Web/API/DOMPointReadOnly
export function transformXY(m: math.Matrix, x: number, y: number) {
  const nm = math.multiply(m, [x, y, 1]);
  return [nm.get([0]), nm.get([1])] as const;
}

export function scale(m: math.Matrix, sf: number) {
  return math.multiply(
    m,
    math.matrix([
      [sf, 0, 0],
      [0, sf, 0],
      [0, 0, 1],
    ])
  );
}

export function translate(m: math.Matrix, dx: number, dy: number) {
  return math.multiply(
    m,
    math.matrix([
      [1, 0, dx],
      [0, 1, dy],
      [0, 0, 1],
    ])
  );
}

export function center(coords: Coords) {
  return coords.length > 1
    ? coords
        .reduce(([xAcc, yAcc], [x, y]) => [xAcc + x, yAcc + y], [0, 0])
        .map((k) => k / coords.length)
    : coords[0];
}

export function centerDiff(co1: Coords, co2: Coords) {
  const c1 = center(co1);
  const c2 = center(co2);
  return [c1[0] - c2[0], c1[1] - c2[1]] as const;
}

export function distance(c: Coords) {
  return c.length === 2
    ? Math.sqrt(Math.pow(c[0][0] - c[1][0], 2) + Math.pow(c[0][1] - c[1][1], 2))
    : 0;
}

export function fdm(m: DOMMatrix) {
  return math.matrix([
    [m.a, m.c, m.e],
    [m.b, m.d, m.f],
    [0, 0, 1],
  ]);
}

export function tdm(m: math.Matrix) {
  return new DOMMatrix([
    m.get([0, 0]),
    m.get([1, 0]),
    m.get([0, 1]),
    m.get([1, 1]),
    m.get([0, 2]),
    m.get([1, 2]),
  ]);
}

// export function m3d(m: DOMMatrix) {
//   return `matrix3d(${[
//     [m.m11, m.m12, m.m13, m.m14],
//     [m.m21, m.m22, m.m23, m.m24],
//     [m.m31, m.m32, m.m33, m.m34],
//     [m.m41, m.m42, m.m43, m.m44],
//   ]})`;
// }
