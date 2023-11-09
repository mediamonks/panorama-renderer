import {PanoramaRenderer} from '../../../dist/';
import ImageLoader from '../utils/ImageLoader';

export default class Panorama {
  constructor(container) {
    this.container = container;
    this.hotspots = [];
    this.hotspotVisuals = [];

    ImageLoader.loadImages(['panorama_1.jpg']).then((images) => {
      this.renderer = new PanoramaRenderer(container, images[0], {fov: 60});
      this.renderer.play();

      const position = {x: 0.5, y: 0.5, z: 1};
      this.createHotspot(position);
      this.renderer.lookAtPosition(position);

      this.renderer.canvas.onmousedown = (e) => {
        const bounds = this.renderer.canvas.getBoundingClientRect();
        const x = (e.clientX - bounds.left) / bounds.width;
        const y = (e.clientY - bounds.top) / bounds.height;
        if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
          const pos = this.renderer.get3dPositionFrom2DPosition({x, y});
          this.createHotspot(pos);
          this.renderer.lookAtPosition(pos, 2);
        }
      };

      this.renderer.tick(() => this.tick());
    });
  }

  createHotspot(position) {
    const e = document.createElement('div');
    e.style.zIndex = '1';
    e.style.width = 10 + 'px';
    e.style.height = 10 + 'px';
    e.style.backgroundColor = '#FF0000';
    e.style.position = 'absolute';
    this.container.appendChild(e);
    this.hotspotVisuals.push(e);
    this.hotspots.push(position);
  }

  tick() {
    for (let i = 0; i < this.hotspots.length; i++) {
      const worldPos = this.hotspots[i];
      const screenPos = this.renderer.getProjectedPosition(worldPos);

      if (screenPos.x > 0 && screenPos.x < 1 && screenPos.y >= 0 && screenPos.y < 1) {
        const x = screenPos.x * this.renderer.canvas.width - 5;
        const y = screenPos.y * this.renderer.canvas.height - 5;

        this.hotspotVisuals[i].style.left = x + 'px';
        this.hotspotVisuals[i].style.top = y + 'px';
        this.hotspotVisuals[i].style.display = 'block';
      } else {
        this.hotspotVisuals[i].style.display = 'none';
      }
    }
  }
}
