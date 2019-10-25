import {PanoramaRenderer} from '../../../src/';
import ImageLoader from '../utils/ImageLoader';
import { ImageEffectRenderer } from 'seng-effectrenderer';
import { IRotationController } from '../../../src/lib/PanoramaRenderer';
const glitch = require('../shader/glitch.glsl');
const panoramaMix = require('../shader/panoramaMix.glsl');
import { quat} from 'gl-matrix';

class AutoRotationController implements IRotationController {
  private rotation:number = 0;

  public init() {}

  public update(rotation: quat) {
    this.rotation += .01;
    quat.identity(rotation);
    quat.rotateY(rotation, rotation, this.rotation);
  }
}

export default class PanoramaAdvanced {
  private panorama: PanoramaRenderer;
  private renderer: ImageEffectRenderer;

  private wrapper: HTMLElement;

  constructor(wrapper: HTMLElement) {
    this.wrapper = wrapper;
    ImageLoader.loadImages(['panorama_1.jpg', 'panorama_2.jpg']).then(this.init.bind(this));
  }

  private init(images: Array<HTMLImageElement>): void {
    this.renderer = ImageEffectRenderer.createTemporary(this.wrapper.querySelector('.canvas'), glitch);

    this.renderer.addBuffer(0, panoramaMix);
    this.renderer.getBuffer(0).addImage(images[0],0, true, true, true, false);
    this.renderer.getBuffer(0).addImage(images[1],1, true, true, true, false);

    this.renderer.getMainBuffer().addImage(this.renderer.getBuffer(0), 0);

    this.panorama = new PanoramaRenderer(this.wrapper, null, {
      fov: 90,
      imageEffectRendererBuffer: this.renderer.getBuffer(0),
      rotationController: new AutoRotationController(),
    });
    this.panorama.init();
    this.renderer.play();

    this.tick(0);
  }

  private tick(time:number): void {
    requestAnimationFrame((time) => this.tick(time));
    this.panorama.getRendererBuffer().setUniformFloat('uMix', Math.abs(((time/10000) % 1) -.5) * 2);
  }
}
