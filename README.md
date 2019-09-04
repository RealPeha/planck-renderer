# Small rendering library for [plank-js](https://github.com/shakiba/planck.js "plank-js")

A small library for rendering objects from the planck-js library
It is written without using third-party libraries and renders
If you want to use planck-js together with stage-js libraries, then in the [stage-js branch](https://github.com/RealPeha/planck-renderer/tree/stage-js "stage-js branch") you can find another version

### Install

#### npm
```
npm install planck-renderer --save
```

#### yarn
```
yarn add planck-renderer
```

### Example

```javascript
import { World, Edge, Vec2, Circle } from 'plank-js'
import Renderer from "planck-renderer";

const canvas = document.querySelector('#test')
const ctx = canvas.getContext('2d')

const world = new World(Vec2(0, -10));
const renderer = new Renderer(world, ctx, {
	// default settings
	fps: 60,
	scale: 1,
	speed: 1,
})

// init world entities
world.createBody().createFixture(Edge(Vec2(-40.0, 0.0), Vec2(40.0, 0.0)));
world.createDynamicBody(Vec2(0.0, 4.5)).createFixture(Circle(0.5), 10.0);
world.createDynamicBody(Vec2(0.0, 10.0)).createFixture(Circle(5.0), 10.0);

renderer.startUpdate(); // start rendering world
```

A more detailed example can be found in the folder [example](https://github.com/RealPeha/planck-renderer/tree/master/example "example")
