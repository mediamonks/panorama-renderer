# Panorama Renderer

The panorama-renderer is a lightweight package that allows you to render equirectangular panoramas using WebGL.

## Getting started

### Installing

Add `@mediamonks/panorama-renderer` to your project:

```sh
npm i @mediamonks/panorama-renderer
```
## Basic usage

Simple panorama rendering on canvas. Make sure the image is loaded before creating the renderer.

```ts
import { PanoramaRenderer } from '@mediamonks/panorama-renderer';

const renderer = PanoramaRenderer(wrapperElement, image, { loop: true });
```

## Building

To build panorama-renderer, ensure that you have [Git](http://git-scm.com/downloads)
and [Node.js](http://nodejs.org/) installed.

Clone a copy of the repo:
```sh
git clone https://github.com/mediamonks/panorama-renderer.git
```

Change to the image-effect-renderer directory:
```sh
cd panorama-renderer
```

Install dev dependencies:
```sh
npm i
```

Build package:
```sh
npm run build
```
