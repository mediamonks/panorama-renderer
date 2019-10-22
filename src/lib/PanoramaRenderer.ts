import {mat3, mat4, quat, vec3, vec4} from 'gl-matrix';
import {ImageEffectRenderer} from 'seng-effectrenderer';
import sengDisposable from 'seng-disposable';

class MouseButton {
  public press: boolean = false; // currently pressed
  public down: boolean = false;  // moment of press start
  public oldDown: boolean = false;
  public hit: boolean = false;
  public downTime: number = 0;
}

class MouseListener extends sengDisposable {
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
    super();
    this.canvas = canvas;

    for (let i = 0; i < 3; i++) {
      this.buttons.push(new MouseButton());
    }

    this.touchMoveListener = e => this.setMouse(e.targetTouches[0]);
    this.mouseMoveListener = e => this.setMouse(e);
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

  private onMouseStart = (event: TouchEvent | MouseEvent): void => {
    event.preventDefault();

    const isTouch = event instanceof TouchEvent;
    this.resetSpeed = true;

    this.buttons[isTouch ? 0 : event.which - 1].press = true;
    this.setMouse(isTouch ? (<TouchEvent>event).targetTouches[0] : event);

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

  dispose() {
    if (!this.isDisposed()) {
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

      this.normalized = null;
      this.mouseVelocity = null;
      this.previousMousePos = null;
    }

    super.dispose();
  }
}

export default class PanoramaRenderer extends sengDisposable {
  private imageEffectRender: ImageEffectRenderer;
  private mouseListener: MouseListener;
  private rotateSpeedX: number = 0;
  private rotateSpeedY: number = 0;
  private inertia: number;
  private smoothness: number;
  private fovV: number;
  private barrelDistortion: number = 0;
  private transitionProgress: number = 1;
  private animationLoop: boolean = false;

  private rotateX: quat = quat.create();
  private rotateY: quat = quat.create();
  private rotation: quat = quat.create();
  private rotationStart: quat = quat.create();
  private rotationEnd: quat = quat.create();
  private projection: mat4 = mat4.create();
  private view: mat4 = mat4.create();
  private viewProjection: mat4 = mat4.create();
  private invViewProjection: mat4 = mat4.create();
  private screenPos: vec4 = vec4.create();
  private tempM3: mat3 = mat3.create();
  private tempV3: vec3 = vec3.create();
  private tempV4: vec4 = vec4.create();

  // wide fov will distort. This can be countered using barrel distortion
  // http://www.decarpentier.nl/downloads/lensdistortion-webgl/lensdistortion-webgl.html
  constructor(canvasParent: HTMLElement, image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, fovDegrees: number = 70, rotateInertia = 0.95, smoothness = 0.75, barrelDistortion = 0.25) {
    super();

    this.inertia = rotateInertia;
    this.fovV = fovDegrees;
    this.smoothness = smoothness;
    this.barrelDistortion = barrelDistortion;
    this.imageEffectRender = ImageEffectRenderer.createTemporary(canvasParent, this.getShader());

    this.imageEffectRender.addImage(image, 0, false, true, true);

    mat4.identity(this.view);
    this.mouseListener = new MouseListener(this.imageEffectRender.getCanvas());
  }

  private getShader(): string {
    return 'uniform mat4 uInvViewProjection;\
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
      }';
  }

  public init(): void {
    this.play();
  }

  private updateViewProjection(fov: number, aspect: number): void {
    mat4.perspective(this.projection, fov * (Math.PI / 180.0), aspect, 0.01, 100);
    mat4.fromQuat(this.view, this.rotation);
    mat4.multiply(this.viewProjection, this.projection, this.view);
  }

  private static smoothstep01(xi: number): number {
    let x = xi;
    if (x < 0) x = 0;
    if (x > 1) x = 1;
    return x * x * (3 - 2 * x);
  }

  private static lerp(a: number, b: number, i: number): number {
    return ((1 - i) * a) + (i * b);
  }

  public update(): void {
    if (this.isDisposed() || !this.animationLoop) return;

    this.mouseListener.update();

    // aspect ratio can change
    const c = this.imageEffectRender.getCanvas();
    const aspect = c.width / c.height;
    const degToRad = Math.PI / 180;
    const z = .5 / Math.tan(this.fovV * (.5 * degToRad));
    const fovH = Math.atan2(aspect * .5, z) * (2 * 180 / Math.PI);

    if (this.mouseListener.getMouseDown()) {
      const ms = this.mouseListener.getNormalizedVelocity();
      this.rotateSpeedX = PanoramaRenderer.lerp(-ms[0] * fovH, this.rotateSpeedX, this.smoothness);
      this.rotateSpeedY = PanoramaRenderer.lerp(ms[1] * this.fovV, this.rotateSpeedY, this.smoothness);
    } else {
      this.rotateSpeedX *= this.inertia;
      this.rotateSpeedY *= this.inertia;
    }

    if (this.transitionProgress >= 1) {
      quat.identity(this.rotateY);
      quat.identity(this.rotateX);
      quat.rotateY(this.rotateY, this.rotateY, this.rotateSpeedX * degToRad);
      quat.rotateX(this.rotateX, this.rotateX, -this.rotateSpeedY * degToRad);
      // https://gamedev.stackexchange.com/questions/136174/im-rotating-an-object-on-two-axes-so-why-does-it-keep-twisting-around-the-thir
      // note that the order is switched here:
      quat.multiply(this.rotation, this.rotateX, this.rotation);
      quat.multiply(this.rotation, this.rotation, this.rotateY);

    } else {
      // assumes 60 fps
      this.transitionProgress += 0.016;
      quat.slerp(this.rotation, this.rotationStart, this.rotationEnd, PanoramaRenderer.smoothstep01(this.transitionProgress));
    }
    this.updateViewProjection(this.fovV, aspect);
    mat4.invert(this.invViewProjection, this.viewProjection);


    this.imageEffectRender.setUniformMatrix('uInvViewProjection', this.invViewProjection);
    this.imageEffectRender.setUniformFloat('uBarrelDistortion', this.barrelDistortion);
    this.imageEffectRender.draw();

    window.requestAnimationFrame(() => this.update());
  }

  public getProjectedPosition(worldPos: Float32Array): number[] {
    const s = this.screenPos;
    s[0] = worldPos[0];
    s[1] = worldPos[1];
    s[2] = worldPos[2];
    s[3] = 1;

    vec4.transformMat4(s, s, this.viewProjection);

    s[0] /= s[3];
    s[1] /= s[3];

    // the following does the inverse of the barrel distortion:
    const l = Math.sqrt(s[0] * s[0] + s[1] * s[1]);
    const b = this.barrelDistortion;
    if (b * l > 0) {
      // Reinder magic
      const x0 = Math.pow(9 * b * b * l + Math.sqrt(3) * Math.sqrt(27 * b * b * b * b * l * l + 4 * b * b * b), 1 / 3);
      let x = x0 / (Math.pow(2, 1 / 3) * Math.pow(3, 2 / 3) * b);
      x -= Math.pow(2 / 3, 1 / 3) / x0;
      const f = x / l;

      s[0] = s[0] * f;
      s[1] = s[1] * f;
    }

    s[0] = s[0] * 0.5 + 0.5;
    s[1] = s[1] * -0.5 + 0.5;

    return [s[0], s[1], s[2]];
  }

  public lookAtPosition(worldPos: Float32Array, transitionDuration: number = 0) {
    // why the negation?
    vec3.set(this.tempV3, -worldPos[0], -worldPos[1], -worldPos[2]);
    vec3.normalize(this.tempV3, this.tempV3);
    mat4.lookAt(this.view, this.tempV3, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
    mat3.normalFromMat4(this.tempM3, this.view);

    if (transitionDuration > 0) {
      this.transitionProgress = 0;
      quat.copy(this.rotationStart, this.rotation);
      quat.fromMat3(this.rotationEnd, this.tempM3);
    } else {
      quat.fromMat3(this.rotation, this.tempM3);
    }
  }

  public get canvas() {
    return this.imageEffectRender.getCanvas();
  }

  // coordinates should be in 0 -> 1 range
  public get3dPositionFrom2DPosition(xi: number, yi: number) {
    let x = xi * 2 - 1;
    let y = 1 - yi;
    y = y * 2 - 1;
    const r2 = x * x + y * y;
    const distortion = 1 + this.barrelDistortion * r2;
    x *= distortion;
    y *= distortion;
    const rd = this.tempV4;
    vec4.set(rd, x, y, 1, 1);
    vec4.transformMat4(rd, rd, this.invViewProjection);
    return [rd[0], rd[1], rd[2]];
  }

  public play(): void {
    this.animationLoop = true;
    this.update();
  }

  public pause(): void {
    this.animationLoop = false;
  }

  public updateImage(
    image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    clampHorizontal: boolean = true,
    clampVertical: boolean = true ): void {
    this.imageEffectRender.updateImage(image, 0, clampHorizontal, clampVertical, true);
  }

  dispose() {
    if (!this.isDisposed()) {
      this.mouseListener.dispose();
      ImageEffectRenderer.releaseTemporary(this.imageEffectRender);
    }
    super.dispose();
  }
}
