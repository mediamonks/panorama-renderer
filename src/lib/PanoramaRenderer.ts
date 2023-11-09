import {
  ImageEffectRenderer, type ImageEffectRendererOptions, type ImageOptions,
  RendererBuffer,
  RendererInstance
} from "@mediamonks/image-effect-renderer";
import type {IRotationController} from "./RotationController.js";
import RotationController from "./RotationController.js";
import Matrix4x4 from "./Matrix4x4.js";
import Quaternion from "./Quaternion.js";
import {clamp01, smoothstep01} from "./Utils.js";
import Vector3 from "./Vector3.js";
import Matrix3x3 from "./Matrix3x3.js";
import type {Vec2, Vec3} from "./Math.js";
import Vector4 from "./Vector4.js";

export type PanoramaRendererOptions = Partial<ImageEffectRendererOptions> & {
  fov: number,
  barrelDistortion: number,
  shader: string | false,
  renderer: RendererInstance | false,
  rotationController: RotationController | false,
  controlledRendererInstance: RendererInstance | false,
};

export default class PanoramaRenderer {
  private options: PanoramaRendererOptions;
  private static defaultOptions: PanoramaRendererOptions = {
    loop: true,
    fov: 60,
    barrelDistortion: 0.1,
    shader: false,
    renderer: false,
    rotationController: false,
    controlledRendererInstance: false,
    // rotationControllerSettings: {},
  }

  private renderer: RendererInstance;

  private transitionProgress: number = 1;
  private transitionDuration: number = 1;
  private transitionEase: (t: number) => number = smoothstep01;

  private rotationController: IRotationController;

  private rotation = new Quaternion();
  private rotationStart = new Quaternion();
  private rotationEnd = new Quaternion();

  private projection = new Matrix4x4();
  private view = new Matrix4x4();
  private viewProjection = new Matrix4x4();
  private invViewProjection = new Matrix4x4();

  // wide fov will distort. This can be countered using barrel distortion
  // http://www.decarpentier.nl/downloads/lensdistortion-webgl/lensdistortion-webgl.html
  constructor(
    container: HTMLElement,
    image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | RendererBuffer | null,
    options: Partial<PanoramaRendererOptions> = {},
  ) {
    this.options = {...PanoramaRenderer.defaultOptions, ...options};

    if (this.options.renderer !== false) {
      this.renderer = this.options.renderer;
    } else if (this.options.controlledRendererInstance) {
      this.renderer = this.options.controlledRendererInstance.main;
    } else {
      this.renderer = ImageEffectRenderer.createTemporary(container, this.shader, {
        ...{
          useSharedContext: false,
        }, ...options,
      });
    }

    if (this.options.rotationController) {
      this.rotationController = this.options.rotationController;
    } else {
      this.rotationController = new RotationController();
    }

    this.rotationController.init(this, {});
    if (image) {
      this.setImage(0, image, {flipY: true, clampX: false, clampY: true, useMipmap: true});
    }

    this.renderer.tick((dt) => this.drawingLoop(dt));
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

  public tick(func: (dt: number) => void) {
    this.renderer.tick(func);
  }

  public worldToScreen(worldPos: Vec3): Vec3 {
    const s = new Vector4(worldPos.x, worldPos.y, worldPos.z, 1);

    s.transform(this.viewProjection);
    s.x /= s.w;
    s.y /= s.w;

    // the following does the inverse of the barrel distortion:
    const l = Math.sqrt(s.x * s.x + s.y * s.y);
    const b = this.barrelDistortion;
    if (b * l > 0) {
      // Reinder magic
      const x0 = Math.pow(
        9 * b * b * l + Math.sqrt(3) * Math.sqrt(27 * b * b * b * b * l * l + 4 * b * b * b),
        1 / 3,
      );
      let x = x0 / (Math.pow(2, 1 / 3) * Math.pow(3, 2 / 3) * b);
      x -= Math.pow(2 / 3, 1 / 3) / x0;
      const f = x / l;

      s.x *= f;
      s.y *= f;
    }

    s.x = s.x * 0.5 + 0.5;
    s.y = s.y * -0.5 + 0.5;

    return {x: s.x, y: s.y, z: s.z};
  }

  public lookAt(worldPos: Vec3, duration: number = 0, ease: (t: number) => number = smoothstep01) {
    const p = new Vector3(worldPos.x, worldPos.y, worldPos.z);

    this.transitionEase = ease;

    Matrix4x4.lookAt(this.view, Vector3.ZERO, p, Vector3.UP);
    const rotationMatrix = new Matrix3x3();
    Matrix3x3.normalFromMat4(rotationMatrix, this.view);

    if (duration > 0) {
      this.transitionProgress = 0;
      this.rotationStart.copy(this.rotation);
      this.rotationEnd.fromMat3(rotationMatrix);
    } else {
      this.rotation.fromMat3(rotationMatrix);
    }
  }

  public get canvas(): HTMLCanvasElement {
    return this.renderer.canvas;
  }

  public screenToWorld(p: Vec2) {
    let x = p.x * 2 - 1;
    let y = 1 - p.y;
    y = y * 2 - 1;
    const r2 = x * x + y * y;
    const distortion = 1 + this.barrelDistortion * r2;
    x *= distortion;
    y *= distortion;
    const rd = new Vector4(x, y, 1, 1);
    rd.transform(this.invViewProjection);
    return {x: rd.x, y: rd.y, z: rd.z};
  }

  public play(): void {
    this.renderer.play();
  }

  public stop(): void {
    this.renderer.stop();
  }

  public setImage(
    slotIndex: number,
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | RendererBuffer,
    options: Partial<ImageOptions> = {},
  ): void {
    this.renderer.setImage(slotIndex, image, options);
  }

  private drawingLoop(dt: number) {
    this.update(dt);
    this.draw();
  }

  private update(dt: number): void {
    const q = this.rotationController.update(dt, this.rotation);
    this.rotation = new Quaternion(q.x, q.y, q.z, q.w);

    if (this.transitionProgress < 1) {
      // assumes 60 fps
      this.transitionProgress += dt / this.transitionDuration;
      const progress = this.transitionEase(clamp01(this.transitionProgress));
      this.rotation = Quaternion.slerp(
        this.rotationStart,
        this.rotationEnd,
        progress,
      );
    }

    this.updateViewProjection(this.fov, this.aspectRatio);
  }

  private draw() {
    const renderInstance = this.options.controlledRendererInstance ? this.options.controlledRendererInstance : this.renderer;

    renderInstance.setUniformMatrix('uInvViewProjection', new Float32Array(this.invViewProjection.m));
    renderInstance.setUniformFloat('uBarrelDistortion', this.barrelDistortion);
  }

  private updateViewProjection(fov: number, aspect: number): void {
    Matrix4x4.perspective(this.projection, fov * (Math.PI / 180.0), aspect, 0.01, 100);
    Matrix4x4.fromQuat(this.view, this.rotation);
    Matrix4x4.multiply(this.viewProjection, this.projection, this.view);
    Matrix4x4.invert(this.invViewProjection, this.viewProjection);
  }

  private get shader(): string {
    return this.options.shader
      ? this.options.shader
      : `
uniform mat4 uInvViewProjection;
uniform float uBarrelDistortion;

vec2 getEqUV(vec3 rd) {
  vec2 uv = vec2(atan(rd.z, rd.x), asin(rd.y));
  uv *= vec2(0.15915494309, 0.31830988618);
  uv.y += 0.5;
  return fract(uv);
}

void mainImage( out vec4 c, vec2 p ) {
  vec2 uv = vUV0 * 2. - 1.;

  float r2 = dot(uv,uv);
  uv.xy *= 1.0 + uBarrelDistortion * r2;

  vec4 rd = vec4(uv, 1., 1.);

  rd = uInvViewProjection * rd;

  rd.xyz = normalize(rd.xyz);

  vec2 uv1 = getEqUV(rd.xyz);
  vec3 col1 = texture(iChannel0, uv1).xyz;
  vec2 uv2 = uv1;
  uv2.x = fract(uv2.x + 0.5) - 0.5;
  vec3 col2 = texture(iChannel0, uv2).xyz;
  c.xyz = mix(col1, col2, step(abs(uv2.x), 0.25));
  c.w = 1.;
}`;
  }

  public destruct() {
    if (this.renderer instanceof RendererInstance) {
      ImageEffectRenderer.releaseTemporary(this.renderer);
    }
  }
}
