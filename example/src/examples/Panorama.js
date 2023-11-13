import {PanoramaRenderer} from '../../../dist/';
import ImageLoader from '../utils/ImageLoader';

export default class Panorama {
  constructor(container) {
    ImageLoader.loadImages(['panorama_1.jpg']).then((images) => {
      this.renderer = new PanoramaRenderer(container, images[0]);
      this.renderer.play();
    });
  }
}
