import type {Vec2} from "./Math.js";

class MouseButton {
  public press: boolean = false; // currently pressed
  public down: boolean = false; // moment of press start
  public downTime: number = 0;
}

export default class MouseListener {
  private readonly canvas: HTMLCanvasElement;
  private mousePos: Vec2 = {x: 0, y: 0};
  private previousMousePos: Vec2 = {x: 0, y: 0};
  private mouseVelocity: Vec2 = {x: 0, y: 0};
  private normalized: Vec2 = {x: 0, y: 0};
  private mouseClickCallbacks: (() => void)[] = [];
  private buttons: MouseButton[] = [];
  private resetSpeed: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    for (let i = 0; i < 3; i++) {
      this.buttons.push(new MouseButton());
    }

    this.canvas.addEventListener('touchstart', this.onMouseStart.bind(this), false);
    this.canvas.addEventListener('touchmove', this.touchMoveListener.bind(this), false);
    this.canvas.addEventListener('touchend', this.endListener.bind(this), false);
    this.canvas.addEventListener('touchcancel', this.endListener.bind(this), false);
    this.canvas.addEventListener('mousedown', this.onMouseStart.bind(this), false);
    this.canvas.addEventListener('mousemove', this.mouseMoveListener.bind(this), false);
    this.canvas.addEventListener('mouseup', this.endListener.bind(this), false);
    this.canvas.addEventListener('mousecancel', this.endListener.bind(this), false);
    this.canvas.addEventListener('mouseout', this.endListener.bind(this), false);
  }

  private touchMoveListener(e: TouchEvent) {
    this.setMouse(e.targetTouches[0]);
  }

  private mouseMoveListener(e: MouseEvent) {
    this.setMouse(e);
  }

  private endListener() {
    this.buttons[0].press = false;
  }

  private onMouseStart(event: TouchEvent | MouseEvent) {
    event.preventDefault();

    let isTouch = false;
    if (event instanceof TouchEvent) {
      isTouch = true;
      this.setMouse((<TouchEvent>event).targetTouches[0]);
    } else {
      this.setMouse(event);
    }

    this.resetSpeed = true;
    this.buttons[isTouch ? 0 : event.which - 1].press = true;

    this.mouseClickCallbacks.forEach((callback) => {
      callback();
    });
  }

  private setMouse(event: MouseEvent | Touch): void {
    this.mousePos.x = event.pageX;
    this.mousePos.y = event.pageY;
  }

  public get normalizedVelocity(): Vec2 {
    return {...this.mouseVelocity};
  }

  public get mouseDown(): boolean {
    return this.buttons[0].press;
  }

  public click(callback: () => void) {
    this.mouseClickCallbacks.push(callback);
  }

  public update(dt: number): void {
    this.normalized.x = this.mousePos.x / this.canvas.clientWidth;
    this.normalized.y = this.mousePos.y / this.canvas.clientHeight;

    if (this.resetSpeed) {
      this.resetSpeed = false;
      this.mouseVelocity.x = 0;
      this.mouseVelocity.y = 0;
    } else {
      this.mouseVelocity.x = this.normalized.x - this.previousMousePos.x;
      this.mouseVelocity.y = this.normalized.y - this.previousMousePos.y;
    }
    this.previousMousePos.x = this.normalized.x;
    this.previousMousePos.y = this.normalized.y;

    // this section makes sure a drag is not used as a click
    // when the mouse is released after a press longer than 0.25 sec, it is not a click
    for (let i = 0; i < 3; i++) {
      const button: MouseButton = this.buttons[i];
      button.down = false;

      if (this.buttons[i].press) {
        if (button.downTime === 0) {
          button.down = true;
        }
        button.downTime += dt;
      } else {
        button.downTime = 0;
      }
    }
  }

  public destruct() {
    if (this.canvas) {
      this.canvas.removeEventListener('touchstart', this.onMouseStart, false);
      this.canvas.removeEventListener('touchmove', this.touchMoveListener, false);
      this.canvas.removeEventListener('touchend', this.endListener, false);
      this.canvas.removeEventListener('touchcancel', this.endListener, false);
      this.canvas.removeEventListener('mousedown', this.onMouseStart, false);
      this.canvas.removeEventListener('mousemove', this.mouseMoveListener, false);
      this.canvas.removeEventListener('mouseend', this.endListener, false);
      this.canvas.removeEventListener('mousecancel', this.endListener, false);
      this.canvas.removeEventListener('mouseout', this.endListener, false);
    }
  }
}
