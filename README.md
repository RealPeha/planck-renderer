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
	scale: 16,
	speed: 1,
	strokeStyle: {
    	dynamic: 'black',
    	static: 'black',
    	kinematic: 'black',
    },
})

// init world entities
world.createBody().createFixture(Edge(Vec2(-40.0, 0.0), Vec2(40.0, 0.0)));
world.createDynamicBody(Vec2(0.0, 4.5)).createFixture(Circle(0.5), 10.0);
world.createDynamicBody(Vec2(0.0, 10.0)).createFixture(Circle(5.0), 10.0);

renderer.startUpdate(); // start rendering world
```

A more detailed example can be found in the folder [example](https://github.com/RealPeha/planck-renderer/tree/master/example "example")

### renderer.draw

If you need to draw something on the canvas in addition to the physical objects of the engine, then you can do this in the renderer method.
This method returns context and current fps.

```javascript

renderer.draw = (ctx, fps) => {
	ctx.strokeText(`FPS: ${fps}`0, 0)
}
```

### renderer.update

if you need to do any data updates to the beat of the main loop do it in the renderer.update method

```javascript

renderer.update = (step) => {
	// something...
}
```

### Custom figure drawing

```javascript

const ball = world.createDynamicBody(Vec2(5.0, -30.0));
ball.createFixture(Circle(3.0), {
	density: 5.0,
});
ball.render = {
	stroke: 'tomato', // stroke style only for this body
	// or custom drawing function
	custom: (ctx, pos, size) => {
		// draw your circle
	}
}
```

### Custom render function

the first argument this function always returns context. For the circle, the next two arguments will be position (object - x, y) and size (number). For a polygon, the next two arguments will be position (object - x, y) and size (object - width, height)

Let's draw a ball texture instead of a circle

```javascript

const renderer = new Renderer(world, ctx)

const init = img => {
	const ball = world.createDynamicBody(Vec2(5.0, -30.0));
	ball.createFixture(Circle(3.0), {
		density: 5.0,
	});
	ball.render = {
		stroke: 'tomato',
		custom: (ctx, pos, size) => {
			ctx.drawImage(ballImg, pos.x, pos.y, size, size)
			return true // optional
		}
	}

	renderer.startUpdate()
}

const img = new Image()
img.src = "https://pngriver.com/wp-content/uploads/2018/04/Download-Swimming-Pool-Ball-PNG-File.png"
img.onload = () => {
	init(img)
}
```

if the custom function returns true, then it draws the custom method and the built-in