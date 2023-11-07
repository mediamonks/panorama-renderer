import type Quaternion from "./Quaternion.js";


export default class Matrix3x3 {
  public m: number[] = new Array(9);

  constructor(...v: number[]) {
    if (v.length === 9) {
      this.m = [...v];
    } else {
      Matrix3x3.identity(this);
    }
  }

  public clone() {
    return Matrix3x3.clone(this);
  }

  public static clone(a: Matrix3x3) {
    return new Matrix3x3(...a.m);
  }

  public static copy(outm: Matrix3x3, am: Matrix3x3) {
    outm.m = [...am.m];
    return outm;
  }

  public static fromValues(m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number) {
    return new Matrix3x3(m00, m01, m02, m10, m11, m12, m20, m21, m22);
  }

  public static setValues(
    outm: Matrix3x3,
    m00: number,
    m01: number,
    m02: number,
    m10: number,
    m11: number,
    m12: number,
    m20: number,
    m21: number,
    m22: number,
  ) {
    const out = outm.m;
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m10;
    out[4] = m11;
    out[5] = m12;
    out[6] = m20;
    out[7] = m21;
    out[8] = m22;
    return out;
  }

  public static identity(outm: Matrix3x3) {
    const out = outm.m;
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
  }

  public static transpose(outm: Matrix3x3, am: Matrix3x3) {
    const out = outm.m,
      a = am.m;
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
      let a01 = a[1],
        a02 = a[2],
        a12 = a[5];
      out[1] = a[3];
      out[2] = a[6];
      out[3] = a01;
      out[5] = a[7];
      out[6] = a02;
      out[7] = a12;
    } else {
      out[0] = a[0];
      out[1] = a[3];
      out[2] = a[6];
      out[3] = a[1];
      out[4] = a[4];
      out[5] = a[7];
      out[6] = a[2];
      out[7] = a[5];
      out[8] = a[8];
    }

    return out;
  }

  public static invert(outm: Matrix3x3, am: Matrix3x3) {
    const out = outm.m,
      a = am.m;
    let a00 = a[0],
      a01 = a[1],
      a02 = a[2];
    let a10 = a[3],
      a11 = a[4],
      a12 = a[5];
    let a20 = a[6],
      a21 = a[7],
      a22 = a[8];

    let b01 = a22 * a11 - a12 * a21;
    let b11 = -a22 * a10 + a12 * a20;
    let b21 = a21 * a10 - a11 * a20;

    // Calculate the determinant
    let det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) {
      return null;
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
  }

  public static adjoint(outm: Matrix3x3, am: Matrix3x3) {
    const out = outm.m,
      a = am.m;
    let a00 = a[0],
      a01 = a[1],
      a02 = a[2];
    let a10 = a[3],
      a11 = a[4],
      a12 = a[5];
    let a20 = a[6],
      a21 = a[7],
      a22 = a[8];

    out[0] = a11 * a22 - a12 * a21;
    out[1] = a02 * a21 - a01 * a22;
    out[2] = a01 * a12 - a02 * a11;
    out[3] = a12 * a20 - a10 * a22;
    out[4] = a00 * a22 - a02 * a20;
    out[5] = a02 * a10 - a00 * a12;
    out[6] = a10 * a21 - a11 * a20;
    out[7] = a01 * a20 - a00 * a21;
    out[8] = a00 * a11 - a01 * a10;
    return out;
  }

  public static determinant(am: Matrix3x3) {
    const a = am.m;
    let a00 = a[0],
      a01 = a[1],
      a02 = a[2];
    let a10 = a[3],
      a11 = a[4],
      a12 = a[5];
    let a20 = a[6],
      a21 = a[7],
      a22 = a[8];

    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
  }

  public static multiply(outm: Matrix3x3, am: Matrix3x3, bm: Matrix3x3) {
    const out = outm.m,
      a = am.m,
      b = bm.m;
    let a00 = a[0],
      a01 = a[1],
      a02 = a[2];
    let a10 = a[3],
      a11 = a[4],
      a12 = a[5];
    let a20 = a[6],
      a21 = a[7],
      a22 = a[8];

    let b00 = b[0],
      b01 = b[1],
      b02 = b[2];
    let b10 = b[3],
      b11 = b[4],
      b12 = b[5];
    let b20 = b[6],
      b21 = b[7],
      b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
  }

  public static fromQuat(outm: Matrix3x3, q: Quaternion) {
    const out = outm.m;
    const x = q.x,
      y = q.y,
      z = q.z,
      w = q.w;

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

  public static add(outm: Matrix3x3, am: Matrix3x3, bm: Matrix3x3) {
    const out = outm.m,
      a = am.m,
      b = bm.m;
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    out[4] = a[4] + b[4];
    out[5] = a[5] + b[5];
    out[6] = a[6] + b[6];
    out[7] = a[7] + b[7];
    out[8] = a[8] + b[8];
    return out;
  }

  public static subtract(outm: Matrix3x3, am: Matrix3x3, bm: Matrix3x3) {
    const out = outm.m,
      a = am.m,
      b = bm.m;
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    out[4] = a[4] - b[4];
    out[5] = a[5] - b[5];
    out[6] = a[6] - b[6];
    out[7] = a[7] - b[7];
    out[8] = a[8] - b[8];
    return out;
  }

  public static multiplyScalar(outm: Matrix3x3, am: Matrix3x3, b: number) {
    const out = outm.m,
      a = am.m;
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    out[4] = a[4] * b;
    out[5] = a[5] * b;
    out[6] = a[6] * b;
    out[7] = a[7] * b;
    out[8] = a[8] * b;
    return out;
  }

  public static normalFromMat4(outm: Matrix3x3, am: Matrix3x3) {
    const out = outm.m,
      a = am.m;
    const a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
    const a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
    const a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
    const a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];

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

    // Calculate the determinant
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
      return null;
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

    return out;
  }

  public static fromMat4(outm: Matrix3x3, am: Matrix3x3) {
    const out = outm.m,
      a = am.m;
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[4];
    out[4] = a[5];
    out[5] = a[6];
    out[6] = a[8];
    out[7] = a[9];
    out[8] = a[10];
    return out;
  }
}
