import {PanoramaRenderer} from '@mediamonks/panorama-renderer';
import ImageLoader from '../utils/ImageLoader';

export default class Panorama {
    constructor(container) {
        ImageLoader.loadImages(['panorama_2.jpg']).then((images) => {
            this.renderer = new PanoramaRenderer(container, images[0], {loop: true});
            // this.renderer.play();
        });
    }
}
