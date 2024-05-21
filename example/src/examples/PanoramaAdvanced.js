import {quatIdentity, quatRotateY, PanoramaRenderer, ImageEffectRenderer} from '@mediamonks/panorama-renderer';
import glitch from '../shader/glitch.glsl?raw';
import panoramaMix from '../shader/panoramaMix.glsl?raw';
import ImageLoader from "../utils/ImageLoader";

class AutoRotationController {
    constructor() {
        this.rotation = 0;
    }

    init(renderer, options) {
    }

    update(dt, rotation) {
        this.rotation += .2 * dt;
        return quatRotateY(quatIdentity(), this.rotation);
    }
}

export default class PanoramaAdvanced {
    constructor(container) {
        this.container = container;
        this.time = 0;

        ImageLoader.loadImages(['panorama_1.jpg', 'panorama_2.jpg']).then((images) => {
            this.renderer = ImageEffectRenderer.createTemporary(this.container, glitch, {useSharedContext: false});

            this.renderer.createBuffer(0, panoramaMix);
            this.renderer.buffers[0].setImage(0, images[0], {
                clampX: false,
                flipY: true,
                useMipmap: true
            });
            this.renderer.buffers[0].setImage(1, images[1], {
                clampX: false,
                flipY: true,
                useMipmap: true
            });

            this.renderer.setImage(0, this.renderer.buffers[0]);

            this.panorama = new PanoramaRenderer(this.container, null, {
                // renderer: this.renderer,
                fov: 90,
                rotationController: new AutoRotationController(),
                controlledRendererInstance: this.renderer.buffers[0],
            });
            this.panorama.play();
            this.panorama.tick((dt) => {
                this.time += dt;
                this.renderer.buffers[0].setUniformFloat('uMix', Math.abs(((this.time / 10) % 1) - .5) * 2);
            });
        });
    }
}
