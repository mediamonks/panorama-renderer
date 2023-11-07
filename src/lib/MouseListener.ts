class MouseButton {
  public press: boolean = false; // currently pressed
  public down: boolean = false; // moment of press start
  public oldDown: boolean = false;
  public hit: boolean = false;
  public downTime: number = 0;
}

export default class MouseListener {
  private canvas: HTMLCanvasElement;
  private mousePos: Float32Array = new Float32Array([0, 0]);
  private previousMousePos: Float32Array = new Float32Array([0, 0]);
  private mouseVelocity: Float32Array = new Float32Array([0, 0]);
  private normalized: Float32Array = new Float32Array([0, 0]);
  private mouseClickCallbacks: any[] = [];
  private buttons: MouseButton[] = [];
  private resetSpeed: boolean = false;

  private touchMoveListener: any;
  private endListener: any;
  private mouseMoveListener: any;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    for (let i = 0; i < 3; i++) {
      this.buttons.push(new MouseButton());
    }

    this.touchMoveListener = (e: { targetTouches: any[]; }) => this.setMouse(e.targetTouches[0]);
    this.mouseMoveListener = (e: any) => this.setMouse(e);
    this.endListener = () => {
      this.buttons[0].press = false;
    };

    this.canvas.addEventListener('touchstart', this.onMouseStart, false);
    this.canvas.addEventListener('touchmove', this.touchMoveListener, false);
    this.canvas.addEventListener('touchend', this.endListener, false);
    this.canvas.addEventListener('touchcancel', this.endListener, false);
    this.canvas.addEventListener('mousedown', this.onMouseStart, false);
    this.canvas.addEventListener('mousemove', this.mouseMoveListener, false);
    this.canvas.addEventListener('mouseup', this.endListener, false);
    this.canvas.addEventListener('mousecancel', this.endListener, false);
    this.canvas.addEventListener('mouseout', this.endListener, false);
  }

  private onMouseStart = (event: any): void => {
    event.preventDefault();

    let isTouch = false;
    if (window['TouchEvent'] && event instanceof TouchEvent) {
      isTouch = true;
      this.setMouse((<TouchEvent>event).targetTouches[0]);
    } else {
      this.setMouse(event);
    }

    this.resetSpeed = true;
    this.buttons[isTouch ? 0 : event.which - 1].press = true;

    for (let i = 0; i < this.mouseClickCallbacks.length; i++) {
      this.mouseClickCallbacks[i].call(this);
    }
  };

  private setMouse(event: any): void {
    this.mousePos[0] = event.pageX;
    this.mousePos[1] = event.pageY;
  }

  public getNormalizedVelocity(): Float32Array {
    return this.mouseVelocity;
  }

  public getMouseDown(): boolean {
    return this.buttons[0].press;
  }

  public update(): void {
    this.normalized[0] = this.mousePos[0] / this.canvas.clientWidth;
    this.normalized[1] = this.mousePos[1] / this.canvas.clientHeight;

    if (this.resetSpeed) {
      this.resetSpeed = false;
      this.mouseVelocity[0] = 0;
      this.mouseVelocity[1] = 0;
    } else {
      this.mouseVelocity[0] = this.normalized[0] - this.previousMousePos[0];
      this.mouseVelocity[1] = this.normalized[1] - this.previousMousePos[1];
    }
    this.previousMousePos[0] = this.normalized[0];
    this.previousMousePos[1] = this.normalized[1];

    // this section makes sure a drag is not used as a click
    // when the mouse is released after a press longer than 0.25 sec, it is not a click
    for (let i = 0; i < 3; i++) {
      const button: MouseButton = this.buttons[i];
      button.hit = false;
      button.down = false;

      if (this.buttons[i].press) {
        if (button.downTime === 0) {
          button.down = true;
        }
        button.downTime++;
      } else {
        button.hit = button.downTime < 15 && button.oldDown;
        button.downTime = 0;
      }

      button.oldDown = button.press;
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
