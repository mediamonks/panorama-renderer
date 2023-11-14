import {clamp} from "./Utils.js";

const EPSILON = 1e-9;

export type Quat = { x: number, y: number, z: number, w: number };
export type Vec4 = { x: number, y: number, z: number, w: number };
export type Vec3 = { x: number, y: number, z: number };
export type Vec2 = { x: number, y: number };
export type Mat4 = number[];
export type Mat3 = number[];

// Vec3 math
function vec3Add(a: Vec3, b: Vec3): Vec3 {
  return {x: a.x + b.x, y: a.y + b.y, z: a.z + b.z};
}

function vec3Sub(a: Vec3, b: Vec3): Vec3 {
  return {x: a.x - b.x, y: a.y - b.y, z: a.z - b.z};
}

function vec3Cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

function vec3Normalize(v: Vec3): Vec3 {
  const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  return {x: v.x / length, y: v.y / length, z: v.z / length};
}

// Vec4 math

export function vec4Transform(v: Vec4, m: Mat4): Vec4 {
  const x = m[0] * v.x + m[4] * v.y + m[8] * v.z + m[12] * v.w;
  const y = m[1] * v.x + m[5] * v.y + m[9] * v.z + m[13] * v.w;
  const z = m[2] * v.x + m[6] * v.y + m[10] * v.z + m[14] * v.w;
  const w = m[3] * v.x + m[7] * v.y + m[11] * v.z + m[15] * v.w;
  return {x, y, z, w};
}

// Mat4 math

export function mat4Perspective(fovy: number, aspect: number, near: number, far: number): number[] {
  const f = 1.0 / Math.tan(fovy / 2);
  let nf: number;

  const out: number[] = Array(16).fill(0); // Initialize all values to 0
  out[0] = f / aspect;
  out[5] = f;
  out[11] = -1;

  if (far !== null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }

  return out;
}

export function mat4Multiply(a: Mat4, b: Mat4): Mat4 {
  let res = Array(16).fill(0); // Output matrix

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        res[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
      }
    }
  }

  return res;
}

export function mat4Identity(): number[] {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
}

export function mat4Inverse(a: Mat4): Mat4 {
  const out: Mat4 = Array(16).fill(0); // Initialize all values to 0

  const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = a;

  const b00 = a00 * a11 - a01 * a10;
  const b01 = a00 * a12 - a02 * a10;
  const b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11;
  const b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30;
  const b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31;
  const b10 = a21 * a33 - a23 * a31;
  const b11 = a22 * a33 - a23 * a32;

  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return out;
  }
  det = 1.0 / det;

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

  return out;
}

// Mat3 math

export function mat3LookAt(eye: Vec3, target: Vec3, up: Vec3): number[] {
  const zAxis = vec3Normalize(vec3Sub(eye, target));
  const xAxis = vec3Normalize(vec3Cross(up, zAxis));
  const yAxis = vec3Normalize(vec3Cross(zAxis, xAxis));

  return [
    xAxis.x, yAxis.x, zAxis.x,
    xAxis.y, yAxis.y, zAxis.y,
    xAxis.z, yAxis.z, zAxis.z
  ];
}

export function mat3ToQuat(m: Mat3): Quat {
  const fTrace = m[0] + m[4] + m[8];
  let x: number, y: number, z: number, w: number;

  if (fTrace > 0.0) {
    // |w| > 1/2, may as well choose w > 1/2
    let fRoot = Math.sqrt(fTrace + 1.0); // 2w
    w = 0.5 * fRoot;
    fRoot = 0.5 / fRoot; // 1/(4w)
    x = (m[5] - m[7]) * fRoot;
    y = (m[6] - m[2]) * fRoot;
    z = (m[1] - m[3]) * fRoot;
  } else {
    // |w| <= 1/2
    let i = 0;
    if (m[4] > m[0]) i = 1;
    if (m[8] > m[i * 3 + i]) i = 2;
    const j = (i + 1) % 3;
    const k = (i + 2) % 3;

    const fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
    const iv = 0.5 * fRoot;
    const ifRoot = 0.5 / fRoot;
    w = (m[j * 3 + k] - m[k * 3 + j]) * ifRoot;
    const jv = (m[j * 3 + i] + m[i * 3 + j]) * ifRoot;
    const kv = (m[k * 3 + i] + m[i * 3 + k]) * ifRoot;

    x = i == 0 ? iv : j == 0 ? jv : kv;
    y = i == 1 ? iv : j == 1 ? jv : kv;
    z = i == 2 ? iv : j == 2 ? jv : kv;
  }

  return {x, y, z, w};
}

export function mat3ToMat4(b: Mat3): Mat4 {
  return [
    b[0], b[1], b[2], 0,
    b[3], b[4], b[5], 0,
    b[6], b[7], b[8], 0,
    0, 0, 0, 1
  ];
}

// Quaternion Math

export function quatIdentity(): Quat {
  return {w: 1, x: 0, y: 0, z: 0};
}

export function quatMultiply(q1: Quat, q2: Quat): Quat {
  const w = q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z;
  const x = q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y;
  const y = q1.w * q2.y - q1.x * q2.z + q1.y * q2.w + q1.z * q2.x;
  const z = q1.w * q2.z + q1.x * q2.y - q1.y * q2.x + q1.z * q2.w;

  return {w: w, x: x, y: y, z: z};
}

export function quatRotateX(q: Quat, angle: number) {
  const sinHalf = Math.sin(angle / 2);
  const cosHalf = Math.cos(angle / 2);
  const rotationQuaternion = {w: cosHalf, x: sinHalf, y: 0, z: 0};
  return quatMultiply(q, rotationQuaternion);
}

export function quatRotateY(q: Quat, angle: number) {
  const sinHalf = Math.sin(angle / 2);
  const cosHalf = Math.cos(angle / 2);
  const rotationQuaternion = {w: cosHalf, x: 0, y: sinHalf, z: 0};
  return quatMultiply(q, rotationQuaternion);
}

export function quatRotateZ(q: Quat, angle: number) {
  const sinHalf = Math.sin(angle / 2);
  const cosHalf = Math.cos(angle / 2);
  const rotationQuaternion = {w: cosHalf, x: 0, y: 0, z: sinHalf};
  return quatMultiply(q, rotationQuaternion);
}

export function quatToEuler(q: Quat): Vec3 {
  const te = quatToMat3(q);

  const m11 = te[0], m12 = te[3], m13 = te[6];
  const m21 = te[1], m22 = te[4], m23 = te[7];
  const m31 = te[2], m32 = te[5], m33 = te[8];

  let x = 0, y = 0, z = 0;

  x = Math.asin(clamp(m32, -1, 1));
  if (Math.abs(m32) < 0.9999999) {
    y = Math.atan2(-m31, m33);
    z = Math.atan2(-m12, m22);
  } else {
    y = 0;
    z = Math.atan2(m21, m11);
  }

  return {x, y, z};
}


export function eulerToQuat(euler: { x: number, y: number, z: number }): Quat {
  let q = quatIdentity();
  q = quatRotateX(q, euler.x);
  q = quatRotateY(q, euler.y);
  q = quatRotateZ(q, euler.z);
  return q;
}

export function quatNormalize(q: Quat): Quat {
  const norm = Math.sqrt(q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z);

  // Return early to prevent division by zero
  if (norm === 0) return {w: 1, x: 0, y: 0, z: 0};

  return {
    w: q.w / norm,
    x: q.x / norm,
    y: q.y / norm,
    z: q.z / norm
  };
}

export function quatSlerp(a: Quat, b: Quat, t: number): Quat {
  let cosom = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;

  if (cosom < 0.0) {
    cosom = -cosom;
    b.x = -b.x;
    b.y = -b.y;
    b.z = -b.z;
    b.w = -b.w;
  }

  let scale0, scale1;

  if (1.0 - cosom > EPSILON) {
    const omega = Math.acos(cosom);
    const sinom = Math.sin(omega);
    scale0 = Math.sin((1.0 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    scale0 = 1.0 - t;
    scale1 = t;
  }

  return quatNormalize({
    x: scale0 * a.x + scale1 * b.x,
    y: scale0 * a.y + scale1 * b.y,
    z: scale0 * a.z + scale1 * b.z,
    w: scale0 * a.w + scale1 * b.w
  });
}

export function quatToMat3(q: Quat): Mat3 {
  const out: number[] = [];
  const {
    x, y, z, w
  } = q;

  const x2 = x + x;
  const y2 = y + y;
  const z2 = z + z;

  const xx = x * x2;
  const yx = y * x2;
  const yy = y * y2;
  const zx = z * x2;
  const zy = z * y2;
  const zz = z * z2;
  const wx = w * x2;
  const wy = w * y2;
  const wz = w * z2;

  out[0] = 1 - yy - zz;
  out[3] = yx - wz;
  out[6] = zx + wy;

  out[1] = yx + wz;
  out[4] = 1 - xx - zz;
  out[7] = zy - wx;

  out[2] = zx - wy;
  out[5] = zy + wx;
  out[8] = 1 - xx - yy;

  return out;
}
