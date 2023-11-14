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
  mat3ToQuat, mat4Identity,
  mat4Inverse,
  mat4Multiply,
  mat4Perspective,
  quatIdentity,
  quatSlerp,
  quatToMat3,
  vec4Transform
} from "./Math.js";

/**
 * @typedef {Object} PanoramaRendererOptions
 * @property {Partial<ImageEffectRendererOptions>} - The configuration options for the image effect renderer.
 * @property {number} fov - The field of view for the panorama viewer, in radians.
 * @property {number} barrelDistortion - The amount of barrel distortion to apply to the panorama.
 * @property {string | false} shader - The shader to use for rendering the panorama. If false, a default shader is used.
 * @property {RendererInstance | false} renderer - The renderer instance to use for rendering the panorama. If false, a new instance is created.
 * @property {RotationController | false} rotationController - The controller to use for handling rotations. If false, a new controller is created.
 * @property {RendererInstance | false} controlledRendererInstance - The render buffer being controlled by the rotation controller. If false, a new instance is created.
 * @property {Partial<RotationControllerOptions>} rotationControllerOptions - Additional configuration options for the rotation controller.
 */
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

  private projection: Mat4 = mat4Identity();
  private view: Mat4 = mat4Identity();
  private viewProjection: Mat4 = mat4Identity();
  private invViewProjection: Mat4 = mat4Identity();

  // wide fov will distort. This can be countered using barrel distortion
  // http://www.decarpentier.nl/downloads/lensdistortion-webgl/lensdistortion-webgl.html

  /**
   * @constructor
   * @description Constructs a PanoramaRenderer instance.
   * @param {HTMLElement} container - The HTML element that will contain the panorama.
   * @param {HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | RendererBuffer | null} image - The image to use for the panorama.
   * @param {Partial<PanoramaRendererOptions>=} options - The configuration options for the Panorama Renderer.
   */
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

  /**
   * @public
   * @description Get the field of view.
   * @type {number}
   */
  public get fov(): number {
    return this.options.fov;
  }

  /**
   * @public
   * @description Set the field of view.
   * @type {number}
   */
  public set fov(fov: number) {
    this.options.fov = fov;
  }

  /**
   * @public
   * @description Get the barrel distortion.
   * @type {number}
   */
  public get barrelDistortion(): number {
    return this.options.barrelDistortion;
  }

  /**
   * @public
   * @description Set the barrel distortion.
   * @type {number}
   */
  public set barrelDistortion(v: number) {
    this.options.barrelDistortion = v;
  }

  /**
   * @public
   * @description Get the aspect ratio of the canvas.
   * @type {number}
   */
  public get aspectRatio(): number {
    return this.canvas.width / this.canvas.height;
  }

  /**
   * @public
   * @function tick
   * @description Register a ready function to be called when the renderer instance is ready.
   * @param {(dt: number) => void} func - The function to call.
   */
  public tick(func: (dt: number) => void) {
    this.renderer.tick(func);
  }

  /**
   * @public
   * @function worldToScreen
   * @description Converts world coordinates to screen coordinates.
   * @param {Vec3} worldPos - The world coordinates.
   * @returns {Vec3} The screen coordinates.
   */
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

  /**
   * @public
   * @function lookAt
   * @description Causes the camera to look at a specified position.
   * @param {Vec3} worldPos - The position to look at.
   * @param {number} [duration=0] - The duration of the transition.
   * @param {(t: number) => number} [ease=smoothstep01] - The easing function for the transition.
   */
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

  /**
   * @public
   * @description Get the canvas element.
   * @type {HTMLCanvasElement}
   */
  public get canvas(): HTMLCanvasElement {
    return this.renderer.canvas;
  }

  /**
   * @public
   * @function screenToWorld
   * @description Converts screen coordinates to world coordinates.
   * @param {Vec2} p - The screen coordinates.
   * @returns {Vec3} The world coordinates.
   */
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

  /**
   * @public
   * @function play
   * @description Commence or resume the rendering loop.
   */
  public play(): void {
    this.renderer.play();
  }

  /**
   * @public
   * @function stop
   * @description Pause the rendering loop.
   */
  public stop(): void {
    this.renderer.stop();
  }

  /**
   * @public
   * @function setImage
   * @description Set an image to a slot for rendering. Possible images can be image elements, video elements, canvas elements, or buffers.
   * @param {number} slotIndex - Index of the slot where to set the image.
   * @param {HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | RendererBuffer} image - The image data that you want to set.
   * @param {Partial<ImageOptions>=} options - The options for the image.
   */
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
