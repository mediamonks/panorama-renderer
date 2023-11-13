export type Quat = { x: number, y: number, z: number, w: number };
export type Vec4 = { x: number, y: number, z: number, w: number };
export type Vec3 = { x: number, y: number, z: number };
export type Vec2 = { x: number, y: number };
export type Mat4 = number[];
export type Mat3 = number[];


// Matrix math

export function mat3ToEulerYXZ(m: Mat3): Vec3 {
  const singularityThreshold = 1 - 1e-6;

  // If the matrix is singular (at the poles), we set the rotation angles accordingly
  if (m[7] > singularityThreshold) { // North pole singularity
    return {
      x: -Math.PI / 2,
      y: -Math.atan2(-m[2], m[0]),
      z: 0
    };
  } else if (m[7] < -singularityThreshold) { // South pole singularity
    return {
      x: Math.PI / 2,
      y: Math.atan2(-m[2], m[0]),
      z: 0
    };
  }

  // If the matrix is not singular, we calculate the rotation angles
  return {
    x: Math.asin(-m[7]),
    y: Math.atan2(m[6], m[8]),
    z: Math.atan2(m[1], m[4])
  };
}

export function mat3ToEulerXYZ(m: Mat3): Vec3 {
  const singularityThreshold = 1 - 1e-6;

  // If the matrix is singular (at the poles), we set the rotation angles accordingly
  if (m[2] > singularityThreshold) { // North pole singularity
    return {
      x: Math.PI / 2,
      y: Math.atan2(m[3], m[4]),
      z: 0
    };
  } else if (m[2] < -singularityThreshold) { // South pole singularity
    return {
      x: -Math.PI / 2,
      y: Math.atan2(m[3], m[4]),
      z: 0
    };
  }

  // If the matrix is not singular, we calculate the rotation angles
  return {
    x: Math.asin(-m[2]),
    y: Math.atan2(m[6], m[0]),
    z: Math.atan2(m[1], m[5])
  };
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

// export function quatToEuler(q: Quat): Vec3 {
//   const m = quatToMat3(q);
//   return mat3ToEulerYXZ(m);
// }

export function clampXRotation(q: Quat, minAngleX: number, maxAngleX: number): Quat {
  const euler = quatToEuler(q);
  euler.x = Math.min(Math.max(euler.x, minAngleX), maxAngleX);
  return eulerToQuat(euler);
}

export function clampYRotation(q: Quat, minAngleY: number, maxAngleY: number): Quat {
  const euler = quatToEuler(q);
  euler.y = Math.min(Math.max(euler.y, minAngleY), maxAngleY);
  return eulerToQuat(euler);
}

function clamp(t: number, min: number, max: number) {
  return Math.max(min, Math.min(max, t));
}

export function quatToEuler(q: Quat): Vec3 {
  const te = quatToMat3(q);

  const m11 = te[0], m12 = te[3], m13 = te[6];
  const m21 = te[1], m22 = te[4], m23 = te[7];
  const m31 = te[2], m32 = te[5], m33 = te[8];

  let _x = 0, _y = 0, _z = 0;

  const order: string = 'ZXY';

  switch (order) {

    case 'XYZ':

      _y = Math.asin(clamp(m13, -1, 1));

      if (Math.abs(m13) < 0.9999999) {

        _x = Math.atan2(-m23, m33);
        _z = Math.atan2(-m12, m11);

      } else {

        _x = Math.atan2(m32, m22);
        _z = 0;

      }

      break;

    case 'YXZ':

      _x = Math.asin(-clamp(m23, -1, 1));

      if (Math.abs(m23) < 0.9999999) {

        _y = Math.atan2(m13, m33);
        _z = Math.atan2(m21, m22);

      } else {

        _y = Math.atan2(-m31, m11);
        _z = 0;

      }

      break;

    case 'ZXY':

      _x = Math.asin(clamp(m32, -1, 1));

      if (Math.abs(m32) < 0.9999999) {

        _y = Math.atan2(-m31, m33);
        _z = Math.atan2(-m12, m22);

      } else {

        _y = 0;
        _z = Math.atan2(m21, m11);

      }

      break;

    case 'ZYX':

      _y = Math.asin(-clamp(m31, -1, 1));

      if (Math.abs(m31) < 0.9999999) {

        _x = Math.atan2(m32, m33);
        _z = Math.atan2(m21, m11);

      } else {

        _x = 0;
        _z = Math.atan2(-m12, m22);

      }

      break;

    case 'YZX':

      _z = Math.asin(clamp(m21, -1, 1));

      if (Math.abs(m21) < 0.9999999) {

        _x = Math.atan2(-m23, m22);
        _y = Math.atan2(-m31, m11);

      } else {

        _x = 0;
        _y = Math.atan2(m13, m33);

      }

      break;

    case 'XZY':

      _z = Math.asin(-clamp(m12, -1, 1));

      if (Math.abs(m12) < 0.9999999) {

        _x = Math.atan2(m32, m22);
        _y = Math.atan2(m13, m11);

      } else {

        _x = Math.atan2(-m23, m33);
        _y = 0;

      }

      break;
  }
  return {x: _x, y: _y, z: _z};
}


export function eulerToQuat(euler: { x: number, y: number, z: number }): Quat {
  let q = quatIdentity();
  q = quatRotateX(q, euler.x);
  q = quatRotateY(q, euler.y);
  q = quatRotateZ(q, euler.z);
  return q;
}

export function eulerToQua2t(euler: Vec3): Quat {
  const cr = Math.cos(euler.x / 2);
  const sr = Math.sin(euler.x / 2);
  const cp = Math.cos(euler.y / 2);
  const sp = Math.sin(euler.y / 2);
  const cy = Math.cos(euler.z / 2);
  const sy = Math.sin(euler.z / 2);

  const w = cr * cp * cy + sr * sp * sy;
  const x = sr * cp * cy - cr * sp * sy;
  const y = cr * sp * cy + sr * cp * sy;
  const z = cr * cp * sy - sr * sp * cy;

  return {x, y, z, w};
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
