import type Quaternion from "./Quaternion.js";
import type Matrix4x4 from "./Matrix4x4.js";

export default class Vector4 {
  public x: number;
  public y: number;
  public z: number;
  public w: number;

  public static get ZERO(): Vector4 {
    return new Vector4(0, 0, 0, 0);
  }

  public static get ONE(): Vector4 {
    return new Vector4(1, 1, 1, 1);
  }

  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
    (this.x = x), (this.y = y), (this.z = z), (this.w = w);
  }

  /* CLONE, COPY, SET */

  public clone(): Vector4 {
    return new Vector4(this.x, this.y, this.z, this.w);
  }

  public copy(b: Vector4): this {
    (this.x = b.x), (this.y = b.y), (this.z = b.z), (this.w = b.w);
    return this;
  }

  public setValues(x: number, y: number, z: number, w: number) {
    (this.x = x), (this.y = y), (this.z = z), (this.w = w);
    return this;
  }

  public toString(): string {
    return '(' + this.x + ', ' + this.y + ', ' + this.z + ', ' + this.w + ')';
  }

  public length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  public equals(b: Vector4): boolean {
    return b.x === this.x && b.y === this.y && b.z === this.z && b.w === this.w;
  }

  /* MODIFIES IN-PLACE */

  public normalize(): this {
    let l = this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    if (l > 0) {
      l = 1 / Math.sqrt(l);
    }
    this.x *= l;
    this.y *= l;
    this.z *= l;
    this.w *= l;
    return this;
  }

  public negate(): this {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    this.w = -this.w;
    return this;
  }

  public multiplyScalar(v: number): this {
    this.x *= v;
    this.y *= v;
    this.z *= v;
    this.w *= v;
    return this;
  }

  public addScalar(v: number): this {
    this.x += v;
    this.y += v;
    this.z += v;
    this.w += v;
    return this;
  }

  public multiply(v: Vector4): this {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    this.w *= v.w;
    return this;
  }

  public divide(v: Vector4): this {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;
    this.w /= v.w;
    return this;
  }

  public add(v: Vector4): this {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    this.w += v.w;
    return this;
  }

  public subtract(v: Vector4): this {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    this.w -= v.w;
    return this;
  }

  public min(a: Vector4) {
    this.x = Math.min(this.x, a.x);
    this.y = Math.min(this.y, a.y);
    this.z = Math.min(this.z, a.z);
    this.w = Math.min(this.w, a.w);
    return this;
  }

  public max(a: Vector4) {
    this.x = Math.max(this.x, a.x);
    this.y = Math.max(this.y, a.y);
    this.z = Math.max(this.z, a.z);
    this.w = Math.max(this.w, a.w);
    return this;
  }

  public powScalar(a: number) {
    this.x = Math.pow(this.x, a);
    this.y = Math.pow(this.y, a);
    this.z = Math.pow(this.z, a);
    this.w = Math.pow(this.w, a);
    return this;
  }

  public lerp(a: Vector4, b: number) {
    this.x = this.x + (a.x - this.x) * b;
    this.y = this.y + (a.y - this.y) * b;
    this.z = this.z + (a.z - this.z) * b;
    this.w = this.w + (a.w - this.w) * b;
    return this;
  }

  /* RETURNS PRIMITIVE TYPE */

  public dot(b: Vector4): number {
    return b.x * b.x + b.y * b.y + b.z * b.z + b.w * b.w;
  }

  /* MODIFIES IN-PLACE */

  public transform(transformMatrix: Matrix4x4): this {
    const x = this.x,
      y = this.y,
      z = this.z,
      w = this.w,
      m = transformMatrix.m;
    this.x = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    this.y = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    this.z = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    this.w = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return this;
  }

  /* STATIC, RETURNS PRIMITIVE TYPE */

  public static dot(a: Vector4, b: Vector4): number {
    return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
  }

  public static distance(a: Vector4, b: Vector4) {
    const x = b.x - a.x,
      y = b.y - a.y,
      z = b.z - a.z,
      w = b.w - a.w;
    return Math.sqrt(x * x + y * y + z * z + w * w);
  }

  /* STATIC */

  public static add<T extends Vector4>(a: T, b: T): T {
    return a.clone().add(b) as T;
  }

  public static subtract<T extends Vector4>(a: T, b: T): T {
    return a.clone().subtract(b) as T;
  }

  public static multiply<T extends Vector4>(a: T, b: T): T {
    return a.clone().multiply(b) as T;
  }

  public static divide<T extends Vector4>(a: T, b: T): T {
    return a.clone().divide(b) as T;
  }

  public static multiplyScalar<T extends Vector4>(a: T, b: number): T {
    return a.clone().multiplyScalar(b) as T;
  }

  public static powScalar<T extends Vector4>(a: T, b: number): T {
    return a.clone().powScalar(b) as T;
  }

  public static normalize<T extends Vector4>(a: T): T {
    return a.clone().normalize() as T;
  }

  public static max<T extends Vector4>(a: T, b: T): T {
    return a.clone().max(b) as T;
  }

  public static min<T extends Vector4>(a: T, b: T): T {
    return a.clone().min(b) as T;
  }

  public static lerp<T extends Vector4>(a: T, b: T, t: number): T {
    return a.clone().lerp(b, t) as T;
  }

  public static cross(u: Vector4, v: Vector4, w: Vector4) {
    const A = v.x * w.y - v.y * w.x,
      B = v.x * w.z - v.z * w.x,
      C = v.x * w.w - v.w * w.x,
      D = v.y * w.z - v.z * w.y,
      E = v.y * w.w - v.w * w.y,
      F = v.z * w.w - v.w * w.z;
    const G = u.x;
    const H = u.y;
    const I = u.z;
    const J = u.w;
    const out = new Vector4();
    out.x = H * F - I * E + J * D;
    out.y = -(G * F) + I * C - J * B;
    out.z = G * E - H * C + J * A;
    out.w = -(G * D) + H * B - I * A;

    return out;
  }

  public static transform(a: Vector4, transformMatrix: Matrix4x4): Vector4 {
    return a.clone().transform(transformMatrix);
  }

  public static transformQuat(a: Vector4, q: Quaternion) {
    const x = a.x,
      y = a.y,
      z = a.z;
    const qx = q.x,
      qy = q.y,
      qz = q.z,
      qw = q.w;

    // calculate quat * vec
    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;

    const out = new Vector4();
    // calculate result * inverse quat
    out.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    out.w = a.w;
    return out;
  }
}
