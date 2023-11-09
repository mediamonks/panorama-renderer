import PanoramaRenderer from "./PanoramaRenderer.js";
import Quaternion from "./Quaternion.js";
import MouseListener from "./MouseListener.js";
import {lerp} from "./Utils.js";
import type {Quat} from "./Math.js";

export type RotationControllerOptions = {
  inertia: number,
  slowDownTime: number,
}

export interface IRotationController {
  init(renderer: PanoramaRenderer, options: Partial<RotationControllerOptions>): void;

  update(dt: number, rotation: Quat): Quat;
}

export default class RotationController implements IRotationController {
  private static defaultOptions: RotationControllerOptions = {
    inertia: 0.5,
    slowDownTime: 0.5,
  };
  private options: RotationControllerOptions = {...RotationController.defaultOptions};

  private renderer!: PanoramaRenderer;
  private mouseListener!: MouseListener;

  private lastUserRotateSpeed: { x: number, y: number } = {x: 0, y: 0};
  private currentRotateSpeed: { x: number, y: number } = {x: 0, y: 0};
  private slowDownTimer: number = 0;

  public init(renderer: PanoramaRenderer, options: Partial<RotationControllerOptions>): void {
    this.renderer = renderer;
    this.options = {
      ...RotationController.defaultOptions,
      ...options
    };

    this.mouseListener = new MouseListener(this.renderer.canvas);
  }

  public update(dt: number, rotation: Quat): Quat {
    this.mouseListener.update();

    // aspect ratio can change
    const aspect = this.renderer.aspectRatio;
    const degToRad = Math.PI / 180;
    const z = 0.5 / Math.tan(this.renderer.fov * (0.5 * degToRad));
    const fovH = Math.atan2(aspect * 0.5, z) * (2 * 180 / Math.PI);

    if (this.mouseListener.mouseDown) {
      const ms = this.mouseListener.getNormalizedVelocity();
      this.lastUserRotateSpeed.x = lerp(
        -ms[0] * fovH * (1 / dt),
        this.currentRotateSpeed.x,
        this.options.inertia,
      );
      this.lastUserRotateSpeed.y = lerp(
        ms[1] * this.renderer.fov * (1 / dt),
        this.currentRotateSpeed.y,
        this.options.inertia,
      );
      this.slowDownTimer = this.options.slowDownTime;
    }

    const t = this.options.slowDownTime > 0 ? this.slowDownTimer / this.options.slowDownTime : 0;

    this.currentRotateSpeed.x = lerp(0, this.lastUserRotateSpeed.x, t);
    this.currentRotateSpeed.y = lerp(0, this.lastUserRotateSpeed.y, t);

    this.slowDownTimer = Math.max(0, this.slowDownTimer - dt);

    const rotateY = new Quaternion().rotateY(this.currentRotateSpeed.x * degToRad * dt);
    const rotateX = new Quaternion().rotateX(-this.currentRotateSpeed.y * degToRad * dt);
    // https://gamedev.stackexchange.com/questions/136174/im-rotating-an-object-on-two-axes-so-why-does-it-keep-twisting-around-the-thir
    // note that the order is switched here:
    let ret = Quaternion.multiply(rotateX, new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w));
    ret = Quaternion.multiply(ret, rotateY);

    // todo clamp max x-rotation
    return ret as Quat;
  }

  public destruct() {
    this.mouseListener.destruct();
  }
}
