export type Quat = { x: number, y: number, z: number, w: number };
export type Vec4 = { x: number, y: number, z: number, w: number };
export type Vec3 = { x: number, y: number, z: number };
export type Vec2 = { x: number, y: number };


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

export function quatRotateY(q: Quat, angle: number) {
  // Calculate half angle for quaternion calculations
  const halfAngle = angle / 2;

  // Calculate sin and cos of the half angle
  const sinHalf = Math.sin(halfAngle);
  const cosHalf = Math.cos(halfAngle);

  // Create a new quaternion representing the rotation around y-axis
  const rotationQuaternion = {w: cosHalf, x: 0, y: sinHalf, z: 0};

  return quatMultiply(q, rotationQuaternion);
}

export function quatToEuler(q: Quat): Vec3 {
  const ysqr = q.y * q.y;

  const t0 = 2.0 * (q.w * q.x + q.y * q.z);
  const t1 = 1.0 - 2.0 * (q.x * q.x + ysqr);
  const roll = Math.atan2(t0, t1);

  const t2 = 2.0 * (q.w * q.y - q.z * q.x);
  const t2Clamped = Math.min(1, Math.max(-1, t2));
  const pitch = Math.asin(t2Clamped);

  const t3 = 2.0 * (q.w * q.z + q.x * q.y);
  const t4 = 1.0 - 2.0 * (ysqr + q.z * q.z);
  const yaw = Math.atan2(t3, t4);

  return {x: roll, y: pitch, z: yaw};
}

export function eulerToQuat(euler: { x: number, y: number, z: number }): Quat {
  const cy = Math.cos(euler.z * 0.5);
  const sy = Math.sin(euler.z * 0.5);
  const cp = Math.cos(euler.y * 0.5);
  const sp = Math.sin(euler.y * 0.5);
  const cr = Math.cos(euler.x * 0.5);
  const sr = Math.sin(euler.x * 0.5);

  const w = cy * cp * cr + sy * sp * sr;
  const x = cy * cp * sr - sy * sp * cr;
  const y = sy * cp * sr + cy * sp * cr;
  const z = sy * cp * cr - cy * sp * sr;

  return {w: w, x: x, y: y, z: z};
}

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
