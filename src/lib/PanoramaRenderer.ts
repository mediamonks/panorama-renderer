import {
  ImageEffectRenderer, type ImageEffectRendererOptions, type ImageOptions,
  RendererBuffer,
  RendererInstance
} from "@mediamonks/image-effect-renderer";
import type {IRotationController, RotationControllerOptions} from "./RotationController.js";
import RotationController from "./RotationController.js";
import {clamp01, smoothstep01} from "./Utils.js";
import type {Mat4, Quat, Vec2, Vec3, Vec4} from "./Math.js";
import {
  mat3LookAt,
  mat3ToMat4,
  mat3ToQuat,
  mat4Inverse,
  mat4Multiply,
  mat4Perspective,
  quatIdentity,
  quatSlerp,
  quatToMat3,
  vec4Transform
} from "./Math.js";

export type PanoramaRendererOptions = Partial<ImageEffectRendererOptions> & {
  fov: number, // in radians
  barrelDistortion: number,
  shader: string | false,
  renderer: RendererInstance | false,
  rotationController: RotationController | false,
  controlledRendererInstance: RendererInstance | false,
  rotationControllerOptions: Partial<RotationControllerOptions>,
};

export default class PanoramaRenderer {
  private options: PanoramaRendererOptions;
  private static defaultOptions: PanoramaRendererOptions = {
    loop: true,
    fov: 1,
    barrelDistortion: 0.1,
    shader: false,
    renderer: false,
    rotationController: false,
    controlledRendererInstance: false,
    rotationControllerOptions: {},
  }

  private renderer: RendererInstance;

  private transitionProgress: number = 1;
  private transitionDuration: number = 1;
  private transitionEase: (t: number) => number = smoothstep01;

  private rotationController: IRotationController;

  private rotation: Quat = quatIdentity();
  private rotationStart = quatIdentity();
  private rotationEnd = quatIdentity();

  private projection: Mat4 = [];
  private view: Mat4 = [];
  private viewProjection: Mat4 = [];
  private invViewProjection: Mat4 = [];

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

    this.rotationController.init(this, this.options.rotationControllerOptions);
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
    let s = {...worldPos, w: 1};

    s = vec4Transform(s, this.viewProjection);
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
    const p = {...worldPos};

    this.transitionEase = ease;

    let rotationMatrix = mat3LookAt({x: 0, y: 0, z: 0}, p, {x: 0, y: 1, z: 0});
    this.view = mat3ToMat4(rotationMatrix);

    // this.view = mat4LookAt({x: 0, y: 0, z: 0}, p, {x: 0, y: 1, z: 0});
    // rotationMatrix = mat3NormalizedFromMat4(this.view);

    if (duration > 0) {
      this.transitionProgress = 0;
      this.rotationStart = {...this.rotation};
      this.rotationEnd = mat3ToQuat(rotationMatrix);
    } else {
      this.rotation = mat3ToQuat(rotationMatrix);
    }
  }

  public get canvas(): HTMLCanvasElement {
    return this.renderer.canvas;
  }

  public screenToWorld(p: Vec2): Vec3 {
    let x = p.x * 2 - 1;
    let y = 1 - p.y;
    y = y * 2 - 1;
    const r2 = x * x + y * y;
    const distortion = 1 + this.barrelDistortion * r2;
    x *= distortion;
    y *= distortion;
    const rd = {x, y, z: 1, w: 1};
    const rdt = vec4Transform(rd, this.invViewProjection);
    return {x: rdt.x, y: rdt.y, z: rdt.z};
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
    this.rotation = this.rotationController.update(dt, this.rotation, this.transitionProgress < 1);

    if (this.transitionProgress < 1) {
      this.transitionProgress += dt / this.transitionDuration;
      const progress = this.transitionEase(clamp01(this.transitionProgress));
      this.rotation = quatSlerp(this.rotationStart, this.rotationEnd, progress);
    }

    this.updateViewProjection();
  }

  private draw() {
    const renderInstance = this.options.controlledRendererInstance ? this.options.controlledRendererInstance : this.renderer;

    renderInstance.setUniformMatrix('uInvViewProjection', new Float32Array(this.invViewProjection));
    renderInstance.setUniformFloat('uBarrelDistortion', this.barrelDistortion);
  }

  protected updateViewProjection(): void {
    this.projection = mat4Perspective(this.fov, this.aspectRatio, 0.01, 100);
    this.view = mat3ToMat4(quatToMat3(this.rotation));
    this.viewProjection = mat4Multiply(this.view, this.projection);
    this.invViewProjection = mat4Inverse(this.viewProjection);
  }

  private get shader(): string {
    return this.options.shader ? this.options.shader : PanoramaRenderer.defaultShader;
  }

  public static defaultShader: string = `
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

  public destruct() {
    if (this.renderer instanceof RendererInstance) {
      ImageEffectRenderer.releaseTemporary(this.renderer);
    }
  }
}
