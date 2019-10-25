import { PanoramaRenderer } from '../../../src/';
import ImageLoader from '../utils/ImageLoader';

export default class Panorama {
  private renderer: PanoramaRenderer;
  private wrapper: HTMLElement;
  private hotspotVisuals: HTMLElement[] = [];
  private hotspots: Float32Array[] = [];

  constructor(wrapper: HTMLElement) {
    this.wrapper = wrapper;
    ImageLoader.loadImages(['panorama_1.jpg']).then(this.init.bind(this));
  }

  private init(images: Array<HTMLImageElement>): void {
    this.renderer = new PanoramaRenderer(this.wrapper.querySelector('.canvas'), images[0]);
    this.renderer.init();

    this.wrapper.querySelector('.js-play').addEventListener('click', () => this.renderer.play());
    this.wrapper.querySelector('.js-stop').addEventListener('click', () => this.renderer.pause());

    const position = [0.5, 0.5, 1];
    this.createHotspot(position);
    this.renderer.lookAtPosition(new Float32Array(position));

    this.renderer.getCanvas().onmousedown = (e) => {
      const bounds = this.renderer.getCanvas().getBoundingClientRect();
      const x = (e.clientX - bounds.left) / bounds.width;
      const y = (e.clientY - bounds.top) / bounds.height;
      if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
        const pos = this.renderer.get3dPositionFrom2DPosition(x, y);
        this.createHotspot(pos);
        this.renderer.lookAtPosition(new Float32Array(pos), 2);
      }
    };

    this.tick();
  }

  private createHotspot(position: number[]) {
    const e = document.createElement('div');
    e.style.zIndex = '1';
    e.style.width = 10 + 'px';
    e.style.height = 10 + 'px';
    e.style.backgroundColor = '#FF0000';
    e.style.position = 'absolute';
    this.wrapper.querySelector('.canvas').appendChild(e);
    this.hotspotVisuals.push(e);
    this.hotspots.push(new Float32Array(position));
  }

  public tick(): void {
    window.requestAnimationFrame(() => this.tick());

    for (let i = 0; i < this.hotspots.length; i++) {
      const worldPos = this.hotspots[i];
      const screenPos = this.renderer.getProjectedPosition(worldPos);

      if (screenPos[2] > 0 && screenPos[0] >= 0 && screenPos[0] < 1 && screenPos[1] >= 0 && screenPos[1] < 1) {
        const x = screenPos[0] * this.renderer.getCanvas().width - 5;
        const y = screenPos[1] * this.renderer.getCanvas().height - 5;

        this.hotspotVisuals[i].style.left = x + 'px';
        this.hotspotVisuals[i].style.top = y + 'px';
        this.hotspotVisuals[i].style.display = 'block';
      } else {
        this.hotspotVisuals[i].style.display = 'none';
      }
    }
  }
}
