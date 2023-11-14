import PanoramaRenderer from "./PanoramaRenderer.js";
import MouseListener from "./MouseListener.js";
import {lerp} from "./Utils.js";
import type {Quat, Vec2, Vec3} from "./Math.js";
import {eulerToQuat, quatToEuler} from "./Math.js";

/**
 * @typedef {Object} RotationControllerOptions
 * @property {number} inertia - Determines the inertia of the camera's rotation on user interaction.
 * @property {number} slowDownTime - Time it takes for the camera to slow down and stop rotating.
 * @property {number[] | undefined} clampXRotation - A two-element array defining the minimum and maximum rotation along the X-axis. If not provided, the rotation isn't clamped.
 * @property {number[] | undefined} clampYRotation - A two-element array defining the minimum and maximum rotation along the Y-axis. If not provided, the rotation isn't clamped.
 * @property {boolean} userInteractions - Determines whether user interactions affect the camera's rotation.
 */
export type RotationControllerOptions = {
  inertia: number,
  slowDownTime: number,
  clampXRotation: number[] | undefined,
  clampYRotation: number[] | undefined,
  userInteractions: boolean,
}

/**
 * @interface IRotationController
 * @description Defines the methods for a rotation controller that controls the camera of a panorama viewer.
 */
export interface IRotationController {
  /**
   * @function init
   * @description Initializes the rotation controller with the provided panorama renderer and options.
   * @param {PanoramaRenderer} renderer - The renderer for displaying the panorama.
   * @param {Partial<RotationControllerOptions>} options - Optional additional configuration for the rotation controller.
   */
  init(renderer: PanoramaRenderer, options: Partial<RotationControllerOptions>): void;

  /**
   * @function update
   * @description Updates the camera's rotation.
   * @param {number} dt - The delta time since the last frame.
   * @param {Quat} rotation - The current rotation of the camera.
   * @param {boolean} animated - Indicates whether the rotation is animated by the viewer.
   * @returns {Quat} The updated rotation quaternion.
   */
  update(dt: number, rotation: Quat, animated: boolean): Quat;
}

export default class RotationController implements IRotationController {
  private static defaultOptions: RotationControllerOptions = {
    inertia: 0.5,
    slowDownTime: 0.5,
    clampXRotation: [-0.5, 0.5],
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
      euler.z = 0;

      if (this.options.clampXRotation) {
        euler.x = Math.min(Math.max(euler.x, this.options.clampXRotation[0]), this.options.clampXRotation[1]);
      }
      if (this.options.clampYRotation) {
        euler.y = Math.min(Math.max(euler.y, this.options.clampYRotation[0]), this.options.clampYRotation[1]);
      }

      return eulerToQuat(euler);
    } else {
      this.euler = quatToEuler(rotation);
      return rotation;
    }
  }

  public destruct() {
    this.mouseListener.destruct();
  }
}
