/*
Original: https://github.com/shakiba/planck.js/blob/master/example/Revolute.js
*/

const { World, Vec2, Box, Edge, Circle, RevoluteJoint, Polygon } = planck

import Renderer from '../dist/renderer.min.js';

const canvas = document.querySelector('#test')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const ctx = canvas.getContext('2d')

ctx.translate(canvas.width / 2, canvas.height / 2)
ctx.scale(-1, 1)
ctx.rotate(Math.PI)


const world = new World(Vec2(0, -10));

const renderer = new Renderer(world, ctx, {
  scale: 10,
})

renderer.clear = (canvas, ctx) => {
  ctx.clearRect(
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );
}

const setup = () => {
  const ground = world.createBody();

  const groundFD = {
    filterCategoryBits: 2,
    filterMaskBits: 0xFFFF,
    filterGroupIndex: 0,
  };
  ground.createFixture(Edge(Vec2(-40.0, 0.0), Vec2(40.0, 0.0)), groundFD);

  const rotator = world.createDynamicBody(Vec2(-10.0, 20.0));
  rotator.createFixture(Circle(0.5), 5.0);

  const w = 100.0;
  rotator.setAngularVelocity(w);
  rotator.setLinearVelocity(Vec2(-8.0 * w, 0.0));

  const joint = world.createJoint(RevoluteJoint({
    motorSpeed: 1.0 * Math.PI,
    maxMotorTorque: 10000.0,
    enableMotor: true,
    lowerAngle: -0.25 * Math.PI,
    upperAngle: 0.5 * Math.PI,
    enableLimit: false,
    collideConnected: true,
  }, ground, rotator, Vec2(-10.0, 12.0)));

  const ball = world.createDynamicBody(Vec2(5.0, 30.0));
  ball.createFixture(Circle(3.0), {
    density: 5.0,
  });

  const platform = world.createBody({
    position: Vec2(20.0, 10.0),
    type: 'dynamic',
    bullet: true,
  });
  platform.createFixture(Box(10.0, 0.2, Vec2(-10.0, 0.0), 0.0), 2.0);

  world.createJoint(RevoluteJoint({
    lowerAngle: -0.25 * Math.PI,
    upperAngle: 0.0 * Math.PI,
    enableLimit: true,
  }, ground, platform, Vec2(20.0, 10.0)));

  const triangle = world.createDynamicBody();

  triangle.createFixture(Polygon([
    Vec2(17.63, 36.31),
    Vec2(17.52, 36.69),
    Vec2(17.19, 36.36)
  ]), 1);
}

setup()

renderer.startUpdate();