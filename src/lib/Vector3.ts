import type Matrix4x4 from "./Matrix4x4.js";
import type Quaternion from "./Quaternion.js";

export default class Vector3 {
  public x: number;
  public y: number;
  public z: number;

  public static get ZERO(): Vector3 {
    return new Vector3(0, 0, 0);
  }

  public static get RIGHT(): Vector3 {
    return new Vector3(1, 0, 0);
  }

  public static get UP(): Vector3 {
    return new Vector3(0, 1, 0);
  }

  public static get FORWARD(): Vector3 {
    return new Vector3(0, 0, 1);
  }

  public static get ONE(): Vector3 {
    return new Vector3(1, 1, 1);
  }

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /* CLONE, COPY, SET */

  public clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  public copy(v: Vector3): Vector3 {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  public setValues(x: number = 0, y: number = 0, z: number = 0): Vector3 {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  /* RETURNS PRIMITIVE TYPE */

  public length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  public lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  public toString(): string {
    return '(' + this.x + ', ' + this.y + ', ' + this.z + ')';
  }

  public equals(b: Vector3): boolean {
    return b.x === this.x && b.y === this.y && b.z === this.z;
  }

  /* MODIFIES IN-PLACE */

  public normalize(): Vector3 {
    let l = this.x * this.x + this.y * this.y + this.z * this.z;
    if (l > 0) {
      l = 1 / Math.sqrt(l);
    }
    this.x *= l;
    this.y *= l;
    this.z *= l;
    return this;
  }

  public negate(): Vector3 {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  }

  public multiplyScalar(v: number): Vector3 {
    this.x *= v;
    this.y *= v;
    this.z *= v;
    return this;
  }

  public addScalar(v: number): Vector3 {
    this.x += v;
    this.y += v;
    this.z += v;
    return this;
  }

  public multiply(v: Vector3): Vector3 {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  }

  public divide(v: Vector3): Vector3 {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;
    return this;
  }

  public add(v: Vector3): Vector3 {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  public subtract(v: Vector3): Vector3 {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  public min(a: Vector3) {
    this.x = Math.min(this.x, a.x);
    this.y = Math.min(this.y, a.y);
    this.z = Math.min(this.z, a.z);
    return this;
  }

  public max(a: Vector3) {
    this.x = Math.max(this.x, a.x);
    this.y = Math.max(this.y, a.y);
    this.z = Math.max(this.z, a.z);
    return this;
  }

  public powScalar(a: number) {
    this.x = Math.pow(this.x, a);
    this.y = Math.pow(this.y, a);
    this.z = Math.pow(this.z, a);
    return this;
  }

  public lerp(a: Vector3, b: number) {
    this.x = this.x + (a.x - this.x) * b;
    this.y = this.y + (a.y - this.y) * b;
    this.z = this.z + (a.z - this.z) * b;
    return this;
  }

  public rotateX(origin: Vector3, angle: number): Vector3 {
    const y = this.y - origin.y;
    const z = this.z - origin.z;

    this.y = y * Math.cos(angle) - z * Math.sin(angle) + origin.y;
    this.z = y * Math.sin(angle) + z * Math.cos(angle) + origin.z;
    return this;
  }

  public rotateY(origin: Vector3, angle: number): Vector3 {
    const x = this.x - origin.x;
    const z = this.z - origin.z;

    this.x = z * Math.cos(angle) - x * Math.sin(angle) + origin.x;
    this.z = z * Math.sin(angle) + x * Math.cos(angle) + origin.z;
    return this;
  }

  public rotateZ(origin: Vector3, angle: number): Vector3 {
    const x = this.x - origin.x;
    const y = this.y - origin.y;

    this.x = x * Math.cos(angle) - y * Math.sin(angle) + origin.x;
    this.y = x * Math.sin(angle) + y * Math.cos(angle) + origin.y;
    return this;
  }

  public transform(transformMatrix: Matrix4x4): Vector3 {
    const x = this.x,
      y = this.y,
      z = this.z,
      m = transformMatrix.m;
    let w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    this.x = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    this.y = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    this.z = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return this;
  }

  public transformQuat(q: Quaternion): Vector3 {
    const qx = q.x,
      qy = q.y,
      qz = q.z,
      qw = q.w;
    const x = this.x,
      y = this.y,
      z = this.z;
    // var qvec = [qx, qy, qz];
    // var uv = vec3.cross([], qvec, a);
    let uvx = qy * z - qz * y,
      uvy = qz * x - qx * z,
      uvz = qx * y - qy * x;
    // var uuv = vec3.cross([], qvec, uv);
    let uuvx = qy * uvz - qz * uvy,
      uuvy = qz * uvx - qx * uvz,
      uuvz = qx * uvy - qy * uvx;
    // vec3.scale(uv, uv, 2 * w);
    const w2 = qw * 2;
    uvx *= w2;
    uvy *= w2;
    uvz *= w2;
    // vec3.scale(uuv, uuv, 2);
    uuvx *= 2;
    uuvy *= 2;
    uuvz *= 2;
    // return vec3.add(out, a, vec3.add(out, uv, uuv));
    this.x = x + uvx + uuvx;
    this.y = y + uvy + uuvy;
    this.z = z + uvz + uuvz;
    return this;
  }

  public randomize(): Vector3 {
    this.x = Math.random() * 2 - 1;
    this.y = Math.random() * 2 - 1;
    this.z = Math.random() * 2 - 1;
    return this;
  }

  public randomize01(): Vector3 {
    this.x = Math.random();
    this.y = Math.random();
    this.z = Math.random();
    return this;
  }

  public randomizeSphere(): Vector3 {
    do {
      this.randomize();
    } while (this.length() > 1);

    return this;
  }

  private static smoothstep1(x: number) {
    return x * x * (3.0 - 2.0 * x);
  }

  public smoothstep(): Vector3 {
    this.x = Vector3.smoothstep1(this.x);
    this.y = Vector3.smoothstep1(this.y);
    this.z = Vector3.smoothstep1(this.z);
    return this;
  }

  /* STATIC, RETURNS PRIMITIVE TYPE */

  public static dot(a: Vector3, b: Vector3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  public static distance(a: Vector3, b: Vector3): number {
    const dx = a.x - b.x,
      dy = a.y - b.y,
      dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /* STATIC */

  public static add(a: Vector3, b: Vector3) {
    return a.clone().add(b);
  }

  public static subtract(a: Vector3, b: Vector3) {
    return a.clone().subtract(b);
  }

  public static multiply(a: Vector3, b: Vector3) {
    return a.clone().multiply(b);
  }

  public static divide(a: Vector3, b: Vector3) {
    return a.clone().divide(b);
  }

  public static multiplyScalar(a: Vector3, b: number) {
    return a.clone().multiplyScalar(b);
  }

  public static powScalar(a: Vector3, b: number) {
    return a.clone().powScalar(b);
  }

  public static normalize(a: Vector3) {
    return a.clone().normalize();
  }

  public static max(a: Vector3, b: Vector3) {
    return a.clone().max(b);
  }

  public static min(a: Vector3, b: Vector3) {
    return a.clone().min(b);
  }

  public static lerp(a: Vector3, b: Vector3, t: number) {
    return a.clone().lerp(b, t);
  }

  public static cross(a: Vector3, b: Vector3): Vector3 {
    const ax = a.x,
      ay = a.y,
      az = a.z;
    const bx = b.x,
      by = b.y,
      bz = b.z;
    return new Vector3(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx);
  }

  public static fract(p: Vector3): Vector3 {
    return new Vector3(p.x - Math.floor(p.x), p.y - Math.floor(p.y), p.z - Math.floor(p.z));
  }

  public static floor(p: Vector3): Vector3 {
    return new Vector3(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z));
  }

  public static transform(a: Vector3, transformMatrix: Matrix4x4): Vector3 {
    return a.clone().transform(transformMatrix);
  }

  public static bezier(a: Vector3, b: Vector3, c: Vector3, d: Vector3, t: number): Vector3 {
    const inverseFactor = 1 - t;
    const inverseFactorTimesTwo = inverseFactor * inverseFactor;
    const factorTimes2 = t * t;
    const factor1 = inverseFactorTimesTwo * inverseFactor;
    const factor2 = 3 * t * inverseFactorTimesTwo;
    const factor3 = 3 * factorTimes2 * inverseFactor;
    const factor4 = factorTimes2 * t;

    const out = new Vector3();
    out.x = a.x * factor1 + b.x * factor2 + c.x * factor3 + d.x * factor4;
    out.y = a.y * factor1 + b.y * factor2 + c.y * factor3 + d.y * factor4;
    out.z = a.z * factor1 + b.z * factor2 + c.z * factor3 + d.z * factor4;
    return out;
  }

  public static transformQuat(a: Vector3, q: Quaternion) {
    return a.clone().transformQuat(q);
  }

  public static angle(a: Vector3, b: Vector3) {
    const ax = a.x,
      ay = a.y,
      az = a.z,
      bx = b.x,
      by = b.y,
      bz = b.z,
      mag1 = Math.sqrt(ax * ax + ay * ay + az * az),
      mag2 = Math.sqrt(bx * bx + by * by + bz * bz),
      mag = mag1 * mag2,
      cosine = mag && Vector3.dot(a, b) / mag;
    return Math.acos(Math.min(Math.max(cosine, -1), 1));
  }
}
