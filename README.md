# Small rendering library for [plank-js](https://github.com/shakiba/planck.js "plank-js")

Это нельзя назвать отдельной библиотекой для рендеринга, но она является немного переписанным стандарным рендером, который идет вместе с planck-js - [testbed](https://github.com/shakiba/planck.js/blob/master/testbed/index.js "testbed"), который в свою очередь основан на[ stage-js](https://github.com/shakiba/stage.js " stage-js")

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

const canvas = document.querySelector('#test')
const world = new World(Vec2(0, -10));
const viewer = new Viewer({
	canvas,
	world,
	// and another settings
})

// init world entities
world.createBody().createFixture(Edge(Vec2(-40.0, 0.0), Vec2(40.0, 0.0)));
world.createDynamicBody(Vec2(0.0, 4.5)).createFixture(Circle(0.5), 10.0);
world.createDynamicBody(Vec2(0.0, 10.0)).createFixture(Circle(5.0), 10.0);

viewer.startUpdate(); // start rendering world
```

Более развернутый пример можно найти в папке [example](https://github.com/RealPeha/planck-renderer/tree/master/example "example")
