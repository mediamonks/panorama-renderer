import PanoramaRenderer from "./PanoramaRenderer.js";
import MouseListener from "./MouseListener.js";
import {lerp} from "./Utils.js";
import type {Quat, Vec2, Vec3} from "./Math.js";
import {
  eulerToQuat,
  quatToEuler
} from "./Math.js";

export type RotationControllerOptions = {
  inertia: number,
  slowDownTime: number,
  clampXRotation: number[] | undefined,
  clampYRotation: number[] | undefined,
  userInteractions: boolean,
}

export interface IRotationController {
  init(renderer: PanoramaRenderer, options: Partial<RotationControllerOptions>): void;

  update(dt: number, rotation: Quat, animated: boolean): Quat;
}

export default class RotationController implements IRotationController {
  private static defaultOptions: RotationControllerOptions = {
    inertia: 0.5,
    slowDownTime: 0.5,
    clampXRotation: [-1, 1],
    clampYRotation: undefined,
    userInteractions: true,
  };
  private options: RotationControllerOptions = {...RotationController.defaultOptions};

  private renderer!: PanoramaRenderer;
  private mouseListener!: MouseListener;

  private lastUserRotateSpeed: Vec2 = {x: 0, y: 0};
  private currentRotateSpeed: Vec2 = {x: 0, y: 0};
  private slowDownTimer: number = 0;
  private euler: Vec3 = {x: 0, y: 0, z: 0};

  public init(renderer: PanoramaRenderer, options: Partial<RotationControllerOptions>): void {
    this.renderer = renderer;
    this.options = {
      ...RotationController.defaultOptions,
      ...options
    };

    this.mouseListener = new MouseListener(this.renderer.canvas);

    console.log(eulerToQuat({x: 0, y: 2, z: 0.5}));
    console.log(quatToEuler(eulerToQuat({x: 0, y: 2, z: 0.5})));
  }

  public update(dt: number, rotation: Quat, animated: boolean): Quat {
    this.mouseListener.update();

    // aspect ratio can change
    const aspect = this.renderer.aspectRatio;
    const z = 0.5 / Math.tan(this.renderer.fov * 0.5);
    const fovH = Math.atan2(aspect * 0.5, z) * 2;

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

    if (this.options.userInteractions && !animated) {
      this.euler = quatToEuler(rotation);
      const euler = this.euler;
      euler.x -= this.currentRotateSpeed.y * dt;
      euler.y += this.currentRotateSpeed.x * dt;
      // euler.z = 0;

      if (this.options.clampXRotation) {
        euler.x = Math.min(Math.max(euler.x, this.options.clampXRotation[0]), this.options.clampXRotation[1]);
      }

      return eulerToQuat(euler);
    } else {
      this.euler = quatToEuler(rotation);
      // this.euler.z = 0;
      return eulerToQuat(this.euler);
    }
  }

  public destruct() {
    this.mouseListener.destruct();
  }
}
