import Vector3 from "./Vector3.js";
import Matrix3x3 from "./Matrix3x3.js";

export default class Quaternion {
  private static EPSILON: number = 1e-9;
  public static IDENTITY: Quaternion = new Quaternion();
  public static ZERO: Quaternion = new Quaternion(0, 0, 0, 0);

  public x: number;
  public y: number;
  public z: number;
  public w: number;

  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
    (this.x = x), (this.y = y), (this.z = z), (this.w = w);
  }

  /* CLONE, COPY, SET */

  public clone(): Quaternion {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }

  public copy(b: Quaternion): Quaternion {
    (this.x = b.x), (this.y = b.y), (this.z = b.z), (this.w = b.w);
    return this;
  }

  public setValues(x: number, y: number, z: number, w: number): Quaternion {
    (this.x = x), (this.y = y), (this.z = z), (this.w = w);
    return this;
  }

  public toString(): string {
    return '(' + this.x + ', ' + this.y + ', ' + this.z + ', ' + this.w + ')';
  }

  /* RETURNS PRIMITIVE TYPE */

  public dot(b: Quaternion): number {
    return Quaternion.dot(this, b);
  }

  /* MODIFIES IN-PLACE */

  public identity(): Quaternion {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 1;
    return this;
  }

  public multiply(a: Quaternion): Quaternion {
    const ax = this.x,
      ay = this.y,
      az = this.z,
      aw = this.w;
    const bx = a.x,
      by = a.y,
      bz = a.z,
      bw = a.w;

    this.x = ax * bw + aw * bx + ay * bz - az * by;
    this.y = ay * bw + aw * by + az * bx - ax * bz;
    this.z = az * bw + aw * bz + ax * by - ay * bx;
    this.w = aw * bw - ax * bx - ay * by - az * bz;
    return this;
  }

  public invert(): Quaternion {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    this.w = this.w;
    return this;
  }

  public rotateEulerValues(x: number, y: number, z: number): Quaternion {
    // note the yxz order for compatibility with older examples
    this.rotateY(y);
    this.rotateX(x);
    this.rotateZ(z);
    return this;
  }

  public rotateX(rad: number): Quaternion {
    rad *= 0.5;

    const ax = this.x,
      ay = this.y,
      az = this.z,
      aw = this.w;
    const bx = Math.sin(rad),
      bw = Math.cos(rad);

    this.x = ax * bw + aw * bx;
    this.y = ay * bw + az * bx;
    this.z = az * bw - ay * bx;
    this.w = aw * bw - ax * bx;
    return this;
  }

  public rotateY(rad: number): Quaternion {
    rad *= 0.5;

    const ax = this.x,
      ay = this.y,
      az = this.z,
      aw = this.w;
    const by = Math.sin(rad),
      bw = Math.cos(rad);

    this.x = ax * bw - az * by;
    this.y = ay * bw + aw * by;
    this.z = az * bw + ax * by;
    this.w = aw * bw - ay * by;
    return this;
  }

  public rotateZ(rad: number): Quaternion {
    rad *= 0.5;

    const ax = this.x,
      ay = this.y,
      az = this.z,
      aw = this.w;
    const bz = Math.sin(rad),
      bw = Math.cos(rad);
    this.x = ax * bw + ay * bz;
    this.y = ay * bw - ax * bz;
    this.z = az * bw + aw * bz;
    this.w = aw * bw - az * bz;
    return this;
  }

  public setAxisAngle(axis: Vector3, angle: number): Quaternion {
    angle = angle * 0.5;
    const s = Math.sin(angle);
    this.x = s * axis.x;
    this.y = s * axis.y;
    this.z = s * axis.z;
    this.w = Math.cos(angle);
    return this;
  }

  public rotateAxisAngle(axis: Vector3, angle: number): Quaternion {
    const a = Quaternion.createFromAxisAngle(axis, angle);

    const ax = a.x,
      ay = a.y,
      az = a.z,
      aw = a.w;
    const bx = this.x,
      by = this.y,
      bz = this.z,
      bw = this.w;

    this.x = ax * bw + aw * bx + ay * bz - az * by;
    this.y = ay * bw + aw * by + az * bx - ax * bz;
    this.z = az * bw + aw * bz + ax * by - ay * bx;
    this.w = aw * bw - ax * bx - ay * by - az * bz;
    return this;
  }

  public lookAt(sourcePoint: Vector3, destPoint: Vector3, up: Vector3): Quaternion {
    const forward = sourcePoint.clone();
    forward.subtract(destPoint);
    forward.normalize();

    const right = Vector3.cross(up, forward);
    right.normalize();

    const up2 = Vector3.cross(forward, right);
    up2.normalize();

    const mat = Matrix3x3.fromValues(right.x, right.y, right.z, up2.x, up2.y, up2.z, forward.x, forward.y, forward.z);

    return this.fromMat3(mat);
  }

  public fromMat3(mat: Matrix3x3): Quaternion {
    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
    // article "Quaternion Calculus and Fast Animation".
    const m = mat.m,
      fTrace = m[0] + m[4] + m[8];
    let fRoot;

    if (fTrace > 0.0) {
      // |w| > 1/2, may as well choose w > 1/2
      fRoot = Math.sqrt(fTrace + 1.0); // 2w
      this.w = 0.5 * fRoot;
      fRoot = 0.5 / fRoot; // 1/(4w)
      this.x = (m[5] - m[7]) * fRoot;
      this.y = (m[6] - m[2]) * fRoot;
      this.z = (m[1] - m[3]) * fRoot;
    } else {
      // |w| <= 1/2
      let i = 0;
      if (m[4] > m[0]) i = 1;
      if (m[8] > m[i * 3 + i]) i = 2;
      const j = (i + 1) % 3;
      const k = (i + 2) % 3;

      fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
      const iv = 0.5 * fRoot;
      const ifRoot = 0.5 / fRoot;
      this.w = (m[j * 3 + k] - m[k * 3 + j]) * ifRoot;
      const jv = (m[j * 3 + i] + m[i * 3 + j]) * ifRoot;
      const kv = (m[k * 3 + i] + m[i * 3 + k]) * ifRoot;

      this.x = i == 0 ? iv : j == 0 ? jv : kv;
      this.y = i == 1 ? iv : j == 1 ? jv : kv;
      this.z = i == 2 ? iv : j == 2 ? jv : kv;
    }

    return this;
  }

  public normalize() {
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

  /* STATIC, RETURNS PRIMITIVE TYPE */

  public static dot(a: Quaternion, b: Quaternion): number {
    return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
  }

  /* STATIC */

  /*  public static copy(out: Quaternion, b: Quaternion): Quaternion {
      out.x = b.x, out.y = b.y, out.z = b.z, out.w = b.w;
      return out;
    }*/

  public static lerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
    const ax = a.x,
      ay = a.y,
      az = a.z,
      aw = a.w;
    const out = new Quaternion();
    out.x = ax + t * (b.x - ax);
    out.y = ay + t * (b.y - ay);
    out.z = az + t * (b.z - az);
    out.w = aw + t * (b.w - aw);
    return out;
  }

  public static closestSlerp(a: Quaternion, b: Quaternion, amount: number): Quaternion {
    if (a.dot(b) < 0) {
      return Quaternion.slerp(a, Quaternion.invert(b), amount);
    } else {
      return Quaternion.slerp(a, b, amount);
    }
  }
/*

  public static lookAt(sourcePoint: Vector3, destPoint: Vector3, up: Vector3): Quaternion {
    const forward = Vector3.subtract(destPoint, sourcePoint).normalize();
    const rotAxis = Vector3.cross(up, forward);
    const dot = Vector3.dot(up, forward);

    const out = new Quaternion();
    out.x = rotAxis.x;
    out.y = rotAxis.y;
    out.z = rotAxis.z;
    out.w = dot + 1;

    return out.normalize();
    // return Quaternion.createFromAxisAngle(rotAxis, Math.acos(dot));
  }
*/

   public static lookAt(sourcePoint: Vector3, destPoint: Vector3, up: Vector3): Quaternion {
    const forward = sourcePoint.clone().subtract(destPoint).normalize();
    const right = Vector3.cross(up, forward).normalize();
    const up2 = Vector3.cross(forward, right).normalize();

    const mat = Matrix3x3.fromValues(
      right.x, right.y, right.z,
      up2.x, up2.y, up2.z,
      forward.x, forward.y, forward.z);

    return Quaternion.fromMat3(mat);
  }

  public static createFromAxisAngle(axis: Vector3, angle: number): Quaternion {
    const halfAngle = angle * 0.5;
    const s = Math.sin(halfAngle);
    return new Quaternion(axis.x * s, axis.y * s, axis.z * s, Math.cos(halfAngle));
  }

  public static getAxisAngle(q: Quaternion): Vector3 {
    const rad = Math.acos(q.w) * 2.0;
    const s = Math.sin(rad / 2.0);
    const out_axis = new Vector3();
    if (s > Quaternion.EPSILON) {
      out_axis.x = q.x / s;
      out_axis.y = q.y / s;
      out_axis.z = q.z / s;
    } else {
      // If s is zero, return any axis (no rotation - axis does not matter)
      out_axis.x = 1;
      out_axis.y = 0;
      out_axis.z = 0;
    }
    return out_axis;
  }

  public static getAngle(a: Quaternion, b: Quaternion) {
    const dotproduct = Quaternion.dot(a, b);

    return Math.acos(2 * dotproduct * dotproduct - 1);
  }

  public static multiply(a: Quaternion, b: Quaternion): Quaternion {
    const ax = a.x,
      ay = a.y,
      az = a.z,
      aw = a.w;
    const bx = b.x,
      by = b.y,
      bz = b.z,
      bw = b.w;

    const out = new Quaternion();
    out.x = ax * bw + aw * bx + ay * bz - az * by;
    out.y = ay * bw + aw * by + az * bx - ax * bz;
    out.z = az * bw + aw * bz + ax * by - ay * bx;
    out.w = aw * bw - ax * bx - ay * by - az * bz;
    return out;
  }

  public static calculateW(a: Quaternion): Quaternion {
    const x = a.x,
      y = a.y,
      z = a.z;
    const out = new Quaternion();
    out.x = x;
    out.y = y;
    out.z = z;
    out.w = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
    return out;
  }

  public static exp(a: Quaternion): Quaternion {
    const x = a.x,
      y = a.y,
      z = a.z,
      w = a.w;

    const r = Math.sqrt(x * x + y * y + z * z);
    const et = Math.exp(w);
    const s = r > 0 ? (et * Math.sin(r)) / r : 0;
    const out = new Quaternion();
    out.x = x * s;
    out.y = y * s;
    out.z = z * s;
    out.w = et * Math.cos(r);

    return out;
  }

  public static ln(a: Quaternion): Quaternion {
    const x = a.x,
      y = a.y,
      z = a.z,
      w = a.w;

    const r = Math.sqrt(x * x + y * y + z * z);
    const t = r > 0 ? Math.atan2(r, w) / r : 0;
    const out = new Quaternion();
    out.x = x * t;
    out.y = y * t;
    out.z = z * t;
    out.w = 0.5 * Math.log(x * x + y * y + z * z + w * w);

    return out;
  }

  public static scale(a: Quaternion, b: number): Quaternion {
    return new Quaternion(a.x * b, a.y * b, a.z * b, a.w * b);
  }

  public static pow(a: Quaternion, b: number): Quaternion {
    let out = Quaternion.ln(a);
    out = Quaternion.scale(out, b);
    return Quaternion.exp(out);
  }

  public static slerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
    // benchmarks:
    const ax = a.x,
      ay = a.y,
      az = a.z,
      aw = a.w;
    let bx = b.x,
      by = b.y,
      bz = b.z,
      bw = b.w;

    let omega, cosom, sinom, scale0, scale1;

    // calc cosine
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    // adjust signs (if necessary)
    if (cosom < 0.0) {
      cosom = -cosom;
      bx = -bx;
      by = -by;
      bz = -bz;
      bw = -bw;
    }
    // calculate coefficients
    if (1.0 - cosom > Quaternion.EPSILON) {
      // standard case (slerp)
      omega = Math.acos(cosom);
      sinom = Math.sin(omega);
      scale0 = Math.sin((1.0 - t) * omega) / sinom;
      scale1 = Math.sin(t * omega) / sinom;
    } else {
      // "from" and "to" quaternions are very close
      //  ... so we can do a linear interpolation
      scale0 = 1.0 - t;
      scale1 = t;
    }

    const out = new Quaternion();
    // calculate final values
    out.x = scale0 * ax + scale1 * bx;
    out.y = scale0 * ay + scale1 * by;
    out.z = scale0 * az + scale1 * bz;
    out.w = scale0 * aw + scale1 * bw;

    return out;
  }

  public static random(): Quaternion {
    // Implementation of http://planning.cs.uiuc.edu/node198.html
    let u1 = Math.random();
    let u2 = Math.random();
    let u3 = Math.random();

    let sqrt1MinusU1 = Math.sqrt(1 - u1);
    let sqrtU1 = Math.sqrt(u1);

    const out = new Quaternion();
    out.x = sqrt1MinusU1 * Math.sin(2.0 * Math.PI * u2);
    out.y = sqrt1MinusU1 * Math.cos(2.0 * Math.PI * u2);
    out.z = sqrtU1 * Math.sin(2.0 * Math.PI * u3);
    out.w = sqrtU1 * Math.cos(2.0 * Math.PI * u3);
    return out;
  }

  public static invert(a: Quaternion): Quaternion {
    const a0 = a.x,
      a1 = a.y,
      a2 = a.z,
      a3 = a.w;
    const dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
    const invDot = dot ? 1.0 / dot : 0;

    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0
    const out = new Quaternion();
    out.x = -a0 * invDot;
    out.y = -a1 * invDot;
    out.z = -a2 * invDot;
    out.w = a3 * invDot;
    return out;
  }

  public static conjugate(a: Quaternion): Quaternion {
    const out = new Quaternion();
    out.x = -a.x;
    out.y = -a.y;
    out.z = -a.z;
    out.w = a.w;
    return out;
  }

  public static fromMat3(mat: Matrix3x3) {
    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
    // article "Quaternion Calculus and Fast Animation".
    const m = mat.m,
      fTrace = m[0] + m[4] + m[8];
    let fRoot;
    const out = new Quaternion();

    if (fTrace > 0.0) {
      // |w| > 1/2, may as well choose w > 1/2
      fRoot = Math.sqrt(fTrace + 1.0); // 2w
      out.w = 0.5 * fRoot;
      fRoot = 0.5 / fRoot; // 1/(4w)
      out.x = (m[5] - m[7]) * fRoot;
      out.y = (m[6] - m[2]) * fRoot;
      out.z = (m[1] - m[3]) * fRoot;
    } else {
      // |w| <= 1/2
      let i = 0;
      if (m[4] > m[0]) i = 1;
      if (m[8] > m[i * 3 + i]) i = 2;
      const j = (i + 1) % 3;
      const k = (i + 2) % 3;

      fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
      const iv = 0.5 * fRoot;
      const ifRoot = 0.5 / fRoot;
      out.w = (m[j * 3 + k] - m[k * 3 + j]) * ifRoot;
      const jv = (m[j * 3 + i] + m[i * 3 + j]) * ifRoot;
      const kv = (m[k * 3 + i] + m[i * 3 + k]) * ifRoot;

      out.x = i == 0 ? iv : j == 0 ? jv : kv;
      out.y = i == 1 ? iv : j == 1 ? jv : kv;
      out.z = i == 2 ? iv : j == 2 ? jv : kv;
    }

    return out;
  }

  public static fromEuler(x: number, y: number, z: number) {
    return new Quaternion().rotateEulerValues(x, y, z);
  }

  /*
  this is faster but does not have the y,x,z rotation sequence
  public static fromEuler(x: number, y: number, z: number) {
    x *= 0.5;
    y *= 0.5;
    z *= 0.5;

    const sx = Math.sin(x);
    const cx = Math.cos(x);
    const sy = Math.sin(y);
    const cy = Math.cos(y);
    const sz = Math.sin(z);
    const cz = Math.cos(z);

    const out = new Quaternion();
    out.x = sx * cy * cz - cx * sy * sz;
    out.y = cx * sy * cz + sx * cy * sz;
    out.z = cx * cy * sz - sx * sy * cz;
    out.w = cx * cy * cz + sx * sy * sz;

    return out;
  }*/
}
