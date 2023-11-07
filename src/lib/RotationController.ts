import PanoramaRenderer from "./PanoramaRenderer.js";
import Quaternion from "./Quaternion.js";
import MouseListener from "./MouseListener.js";

export interface IRotationController {
  init(renderer: PanoramaRenderer, settings: any): void;

  update(rotation: Quaternion): Quaternion;
}

export default class RotationController implements IRotationController {
  private options: any;
  private renderer!: PanoramaRenderer;
  private mouseListener!: MouseListener;

  private rotateSpeedX: number = 0;
  private rotateSpeedY: number = 0;
  private rotateX = new Quaternion();
  private rotateY = new Quaternion();

  public init(renderer: PanoramaRenderer, options: any): void {
    this.renderer = renderer;
    this.options = {
      ...
        {
          rotateInertia: 0.95,
          smoothness: 0.75,
        },
      ...options
    };

    this.mouseListener = new MouseListener(this.renderer.canvas);
  }

  public update(rotation: Quaternion) {
    this.mouseListener.update();

    // aspect ratio can change
    const aspect = this.renderer.aspectRatio;
    const degToRad = Math.PI / 180;
    const z = 0.5 / Math.tan(this.renderer.fov * (0.5 * degToRad));
    const fovH = Math.atan2(aspect * 0.5, z) * (2 * 180 / Math.PI);

    if (this.mouseListener.getMouseDown()) {
      const ms = this.mouseListener.getNormalizedVelocity();
      this.rotateSpeedX = RotationController.lerp(
        -ms[0] * fovH,
        this.rotateSpeedX,
        this.options.smoothness,
      );
      this.rotateSpeedY = RotationController.lerp(
        ms[1] * this.renderer.fov,
        this.rotateSpeedY,
        this.options.smoothness,
      );
    } else {
      this.rotateSpeedX *= this.options.rotateInertia;
      this.rotateSpeedY *= this.options.rotateInertia;
    }

    this.rotateY.identity();
    this.rotateX.identity();
    this.rotateY.rotateY(this.rotateSpeedX * degToRad);
    this.rotateX.rotateX(-this.rotateSpeedY * degToRad);
    // https://gamedev.stackexchange.com/questions/136174/im-rotating-an-object-on-two-axes-so-why-does-it-keep-twisting-around-the-thir
    // note that the order is switched here:
    rotation = Quaternion.multiply(this.rotateX, rotation);
    return Quaternion.multiply(rotation, this.rotateY);
  }

  private static lerp(a: number, b: number, i: number): number {
    return (1 - i) * a + i * b;
  }

  public destruct() {
    this.mouseListener.destruct();
  }
}
