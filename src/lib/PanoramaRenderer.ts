import {
  ImageEffectRenderer, type ImageEffectRendererOptions, type ImageOptions,
  RendererBuffer,
  RendererInstance
} from "@mediamonks/image-effect-renderer";
import type {IRotationController} from "./RotationController.js";
import RotationController from "./RotationController.js";
import Matrix4x4 from "./Matrix4x4.js";
import Vector4 from "./Vector4.js";
import Quaternion from "./Quaternion.js";

export type PanoramaRendererOptions = Partial<ImageEffectRendererOptions> & {
  fov: number,
  barrelDistortion: number,
  shader: string | false,
  renderer: RendererInstance | false,
  rotationController: RotationController | false,
};

export default class PanoramaRenderer {
  private options: PanoramaRendererOptions;
  private static defaultOptions: PanoramaRendererOptions = {
    fov: 60,
    barrelDistortion: 0.1,
    shader: false,
    renderer: false,
    rotationController: false,
    // imageEffectRendererBuffer: false,
    // canvas: false,
    // rotationController: false,
    // rotationControllerSettings: {},
  }

  private renderer: RendererInstance;

  private transitionProgress: number = 1;
  private animationLoop: boolean = false;

  private rotationController: IRotationController;

  private rotation = new Quaternion();
  private rotationStart = new Quaternion();
  private rotationEnd = new Quaternion();

  private projection = new Matrix4x4();
  private view = new Matrix4x4();
  private viewProjection = new Matrix4x4();
  private invViewProjection = new Matrix4x4();

  private screenPos = new Vector4();

  // wide fov will distort. This can be countered using barrel distortion
  // http://www.decarpentier.nl/downloads/lensdistortion-webgl/lensdistortion-webgl.html
  constructor(
    container: HTMLElement,
    image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | null,
    options: Partial<PanoramaRendererOptions> = {},
  ) {
    this.options = {...PanoramaRenderer.defaultOptions, ...options};

    if (this.options.renderer === false) {
      this.renderer = ImageEffectRenderer.createTemporary(container, this.shader, {
        ...{
          useSharedContext: false
        }, ...options,
      });
    } else {
      this.renderer = this.options.renderer;
    }

    if (this.options.rotationController) {
      this.rotationController = this.options.rotationController;
    } else {
      this.rotationController = new RotationController();
    }

    this.rotationController.init(this, {});
    if (image) {
      this.setImage(0, image, {flipY: true, clampX: true, clampY: true, useMipmap: false});
    }
  }

  public get fov(): number {
    return this.options.fov;
  }

  public set fov(fov: number) {
    this.options.fov = fov;
  }

  public get barrelDistortion(): number {
    return this.options.barrelDistortion;
  }

  public set barrelDistortion(v: number) {
    this.options.barrelDistortion = v;
  }

  public get aspectRatio(): number {
    return this.canvas.width / this.canvas.height;
  }

  public update(): void {
    if (!this.animationLoop) return;

    window.requestAnimationFrame(() => this.update());

    this.rotation = this.rotationController.update(this.rotation);

    if (this.transitionProgress < 1) {
      // assumes 60 fps
      this.transitionProgress += 0.016;
      this.rotation = Quaternion.slerp(
        this.rotationStart,
        this.rotationEnd,
        PanoramaRenderer.smoothstep01(this.transitionProgress),
      );
    }
    this.updateViewProjection(this.fov, this.aspectRatio);
    Matrix4x4.invert(this.invViewProjection, this.viewProjection);

    this.renderer.setUniformMatrix('uInvViewProjection', new Float32Array(this.invViewProjection.m));
    this.renderer.setUniformFloat('uBarrelDistortion', this.barrelDistortion);

    if (this.renderer) {
      this.renderer.drawFrame();
    }
  }

  // public getProjectedPosition(worldPos: Float32Array): number[] {
  //   const s = this.screenPos;
  //   s[0] = worldPos[0];
  //   s[1] = worldPos[1];
  //   s[2] = worldPos[2];
  //   s[3] = 1;
  //
  //   vec4.transformMat4(s, s, this.viewProjection);
  //
  //   s[0] /= s[3];
  //   s[1] /= s[3];
  //
  //   // the following does the inverse of the barrel distortion:
  //   const l = Math.sqrt(s[0] * s[0] + s[1] * s[1]);
  //   const b = this.barrelDistortion;
  //   if (b * l > 0) {
  //     // Reinder magic
  //     const x0 = Math.pow(
  //       9 * b * b * l + Math.sqrt(3) * Math.sqrt(27 * b * b * b * b * l * l + 4 * b * b * b),
  //       1 / 3,
  //     );
  //     let x = x0 / (Math.pow(2, 1 / 3) * Math.pow(3, 2 / 3) * b);
  //     x -= Math.pow(2 / 3, 1 / 3) / x0;
  //     const f = x / l;
  //
  //     s[0] = s[0] * f;
  //     s[1] = s[1] * f;
  //   }
  //
  //   s[0] = s[0] * 0.5 + 0.5;
  //   s[1] = s[1] * -0.5 + 0.5;
  //
  //   return [s[0], s[1], s[2]];
  // }

  // public lookAtPosition(worldPos: Vector3, transitionDuration: number = 0) {
  //   Matrix4x4.lookAt(this.view, worldPos, Vector3.ZERO, Vector3.UP);
  //   Matrix3x3.normalFromMat4(this.tempM3, this.view);
  //
  //   if (transitionDuration > 0) {
  //     this.transitionProgress = 0;
  //     quat.copy(this.rotationStart, this.rotation);
  //     quat.fromMat3(this.rotationEnd, this.tempM3);
  //   } else {
  //     quat.fromMat3(this.rotation, this.tempM3);
  //   }
  // }

  public get canvas(): HTMLCanvasElement {
    return this.renderer.canvas;
  }

  // public get3dPositionFrom2DPosition(xi: number, yi: number) {
  //   let x = xi * 2 - 1;
  //   let y = 1 - yi;
  //   y = y * 2 - 1;
  //   const r2 = x * x + y * y;
  //   const distortion = 1 + this.barrelDistortion * r2;
  //   x *= distortion;
  //   y *= distortion;
  //   const rd = this.tempV4;
  //   vec4.set(rd, x, y, 1, 1);
  //   vec4.transformMat4(rd, rd, this.invViewProjection);
  //   return [rd[0], rd[1], rd[2]];
  // }

  public play(): void {
    this.animationLoop = true;
    this.update();
  }

  public stop(): void {
    this.animationLoop = false;
  }

  public setImage(
    slotIndex: number,
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | RendererBuffer,
    options: Partial<ImageOptions> = {},
  ): void {
    this.renderer.setImage(slotIndex, image, options);
  }

  private updateViewProjection(fov: number, aspect: number): void {
    Matrix4x4.perspective(this.projection, fov * (Math.PI / 180.0), aspect, 0.01, 100);
    Matrix4x4.fromQuat(this.view, this.rotation);
    Matrix4x4.multiply(this.viewProjection, this.projection, this.view);
  }

  private get shader(): string {
    return this.options.shader
      ? this.options.shader
      : 'uniform mat4 uInvViewProjection;\
      uniform float uBarrelDistortion;\
      vec2 getEqUV(vec3 rd)\
          {\
            vec2 uv = vec2(atan(rd.z, rd.x), asin(rd.y));\
            uv *= vec2(0.1591,0.3183);\
            uv.y += 0.5;\
            return fract(uv);\
          }\
          void mainImage( out vec4 c, vec2 p )\
          {\
              vec2 uv = vUV0 * 2. - 1.;\
              float r2 = dot(uv,uv);\
              uv.xy *= 1.0 + uBarrelDistortion * r2;\
              vec4 rd = vec4(uv, 1., 1.);\
              rd = uInvViewProjection * rd;\
              rd.xyz = normalize(rd.xyz);\
              c.xyz = texture(iChannel0, getEqUV(rd.xyz)).xyz;\
              c.w = 1.;\
      }';
  }

  private static smoothstep01(xi: number): number {
    let x = xi;
    if (x < 0) x = 0;
    if (x > 1) x = 1;
    return x * x * (3 - 2 * x);
  }

  public destruct() {
    if (this.renderer instanceof RendererInstance) {
      ImageEffectRenderer.releaseTemporary(this.renderer);
    }
  }
}
