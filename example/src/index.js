import Panorama from './examples/Panorama';
import PanoramaVideo from './examples/PanoramaVideo';

const panoramaWrapper = document.querySelector('.panorama');

if (panoramaWrapper) {
  const name = panoramaWrapper.getAttribute('data-className');
  switch (name) {
    case 'panorama':
      new Panorama(panoramaWrapper);
      break;
    case '360-video':
      new PanoramaVideo(panoramaWrapper);
      break;
    default:
      throw new Error(`Can't find a class with name: ${name}`);
      break;
  }
}
