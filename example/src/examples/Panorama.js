import {PanoramaRenderer} from '../../../dist/';
import ImageLoader from '../utils/ImageLoader';

export default class Panorama {

  constructor(container) {
    this.container = container;
    ImageLoader.loadImages(['panorama_1.jpg']).then((images) => {
      this.renderer = new PanoramaRenderer(container, images[0], {fov: 60});
      this.renderer.play();
      //
      // const position = [0.5, 0.5, 1];
      // this.createHotspot(position);
      // this.renderer.lookAtPosition(new Float32Array(position));
      //
      // this.renderer.getCanvas().onmousedown = (e) => {
      //   const bounds = this.renderer.getCanvas().getBoundingClientRect();
      //   const x = (e.clientX - bounds.left) / bounds.width;
      //   const y = (e.clientY - bounds.top) / bounds.height;
      //   if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
      //     const pos = this.renderer.get3dPositionFrom2DPosition(x, y);
      //     this.createHotspot(pos);
      //     this.renderer.lookAtPosition(new Float32Array(pos), 2);
      //   }
      // };

      this.tick();
    });
  }

  createHotspot(position) {
    const e = document.createElement('div');
    e.style.zIndex = '1';
    e.style.width = 10 + 'px';
    e.style.height = 10 + 'px';
    e.style.backgroundColor = '#FF0000';
    e.style.position = 'absolute';
    this.container.querySelector('.canvas').appendChild(e);
    this.hotspotVisuals.push(e);
    this.hotspots.push(new Float32Array(position));
  }

  tick() {
    window.requestAnimationFrame(() => this.tick());
    //
    // for (let i = 0; i < this.hotspots.length; i++) {
    //   const worldPos = this.hotspots[i];
    //   const screenPos = this.renderer.getProjectedPosition(worldPos);
    //
    //   if (screenPos[2] > 0 && screenPos[0] >= 0 && screenPos[0] < 1 && screenPos[1] >= 0 && screenPos[1] < 1) {
    //     const x = screenPos[0] * this.renderer.getCanvas().width - 5;
    //     const y = screenPos[1] * this.renderer.getCanvas().height - 5;
    //
    //     this.hotspotVisuals[i].style.left = x + 'px';
    //     this.hotspotVisuals[i].style.top = y + 'px';
    //     this.hotspotVisuals[i].style.display = 'block';
    //   } else {
    //     this.hotspotVisuals[i].style.display = 'none';
    //   }
    // }
  }
}
