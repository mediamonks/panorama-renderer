export type Quat = { x: number, y: number, z: number, w: number };
export type Vec4 = { x: number, y: number, z: number, w: number };
export type Vec3 = { x: number, y: number, z: number };
export type Vec2 = { x: number, y: number };


export function identityQuaternion(): Quat {
  return {w: 1, x: 0, y: 0, z: 0};
}

export function multiplyQuaternions(q1: Quat, q2: Quat): Quat {
  const w = q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z;
  const x = q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y;
  const y = q1.w * q2.y - q1.x * q2.z + q1.y * q2.w + q1.z * q2.x;
  const z = q1.w * q2.z + q1.x * q2.y - q1.y * q2.x + q1.z * q2.w;

  return {w: w, x: x, y: y, z: z};
}

export function rotateQuaternionY(q: Quat, angle: number) {
  // Calculate half angle for quaternion calculations
  const halfAngle = angle / 2;

  // Calculate sin and cos of the half angle
  const sinHalf = Math.sin(halfAngle);
  const cosHalf = Math.cos(halfAngle);

  // Create a new quaternion representing the rotation around y-axis
  const rotationQuaternion = {w: cosHalf, x: 0, y: sinHalf, z: 0};

  return multiplyQuaternions(q, rotationQuaternion);
}
