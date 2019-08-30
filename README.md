# Small rendering library for [plank-js](https://github.com/shakiba/planck.js "plank-js")

A small library designed to render objects from plank-js, is based on the standard [testbed](https://github.com/shakiba/planck.js/blob/master/testbed/index.js "testbed") renderer, which in turn is based on [stage-js](https://github.com/shakiba/stage.js " stage-js")

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
import Viewer from "planck-renderer";

const world = new World(Vec2(0, -10));
const viewer = new Viewer({
	world,
	// and another settings
})

// init world entities
world.createBody().createFixture(Edge(Vec2(-40.0, 0.0), Vec2(40.0, 0.0)));
world.createDynamicBody(Vec2(0.0, 4.5)).createFixture(Circle(0.5), 10.0);
world.createDynamicBody(Vec2(0.0, 10.0)).createFixture(Circle(5.0), 10.0);

viewer.startUpdate(); // start rendering world
```

A more detailed example can be found in the folder [example](https://github.com/RealPeha/planck-renderer/tree/master/example "example")


### Camera

Usage example

```javascript
import Viewer from "planck-renderer";

const viewer = new Viewer()

const ball = world.createDynamicBody(Vec2(5.0, 30.0)).createFixture(Circle(3.0));

let camera
viewer.ready = () => {
	camera = viewer.camera
}

viewer.step = () => {
	const target = ball.getPosition()
	camera.follow(target, 5)
}
```

or

```javascript
import Viewer, { Camera } from "planck-renderer";

const viewer = new Viewer()

const ball = world.createDynamicBody(Vec2(5.0, 30.0)).createFixture(Circle(3.0));

const camera = new Camera(viewer)

viewer.step = () => {
	const target = ball.getPosition()
	camera.follow(target, 5)
}
```