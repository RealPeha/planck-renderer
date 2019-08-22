/*
Original: https://github.com/shakiba/planck.js/blob/master/example/Revolute.js
*/

const { World, Vec2, Box, Edge, Circle, RevoluteJoint, Polygon, WheelJoint } = planck

import Viewer from "../lib/renderer.min.js";

const canvas = document.querySelector('#game')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const world = new World(Vec2(0, -10));

const KEY = {
  Z: [90, 32],
  X: 88,
}

const viewer = new Viewer({
  canvas,
  world,
  speed: 1.3,
  hz: 50,
})

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
    // filterMaskBits: 1,
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

  viewer.keydown = (keys) => {
    if (keys[KEY.Z]) {
      joint.enableLimit(!joint.isLimitEnabled());
    } else if (keys[KEY.X]) {
      joint.enableMotor(!joint.isMotorEnabled());
    }
  }
}

setup()

viewer.startUpdate();