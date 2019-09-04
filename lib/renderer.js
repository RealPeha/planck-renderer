class Renderer {
  constructor(world, ctx, options = {}) {
    const defaultOptions = {
      scale: 1,
      fps: 60,
      speed: 1
    };
    this.options = Object.assign(defaultOptions, options);

    this.world = world;
    this.ctx = ctx;
    this.canvas = ctx.canvas;

    this.clear = (canvas, ctx) => {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }
  }

  startUpdate() {
    const step = 1 / this.options.fps;
    const slomo = 1 / this.options.speed;
    const slowStep = slomo * step;
    let last = performance.now();
    let dt = 0;
    let now;

    const tick = () => {
      now = performance.now();
      dt = dt + Math.min(1, (now - last) / 1000);
      while (dt > slowStep) {
        this.world.step(step);
        dt -= slowStep;
      }
      last = now;

      this.renderWorld();
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  renderWorld() {
    this.clear(this.canvas, this.ctx);
    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      for (
        let fixture = body.getFixtureList();
        fixture;
        fixture = fixture.getNext()
      ) {
        const type = fixture.getType();
        const shape = fixture.getShape();

        if (type === "circle") {
          fixture.drawn = this.drawCircle(body, shape);
        }
        if (type === "edge") {
          fixture.drawn = this.drawEdge(body, shape);
        }
        if (type === "polygon") {
          fixture.drawn = this.drawPolygon(body, shape);
        }
      }
    }
  }

  drawCircle(body, shape) {
    const options = this.options;
    const ctx = this.ctx;
    const radius = shape.m_radius;
    const pos = body.getPosition();
    const angle = body.getAngle();

    ctx.save();

    ctx.translate(pos.x * options.scale, pos.y * options.scale);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.arc(0, 0, radius * options.scale, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  drawEdge(body, shape) {
    const options = this.options;
    const ctx = this.ctx;

    const v1 = shape.m_vertex1;
    const v2 = shape.m_vertex2;

    ctx.beginPath();
    ctx.moveTo(v1.x * options.scale, v1.y * options.scale);
    ctx.lineTo(v2.x * options.scale, v2.y * options.scale);
    ctx.stroke();
  }

  drawPolygon(body, shape) {
    const options = this.options;
    const ctx = this.ctx;

    const vertices = shape.m_vertices;
    const pos = body.getPosition();
    const angle = body.getAngle();

    if (!vertices.length) {
      return;
    }

    ctx.save();
    ctx.translate(pos.x * options.scale, pos.y * options.scale);
    ctx.rotate(angle);
    ctx.beginPath();
    for (let i = 0; i < vertices.length; ++i) {
      const v = vertices[i];
      const x = v.x;
      const y = v.y;
      if (i === 0) {
        ctx.moveTo(x * options.scale, y * options.scale);
      } else {
        ctx.lineTo(x * options.scale, y * options.scale);
      }
    }

    if (vertices.length > 2) {
      ctx.closePath();
    }

    ctx.stroke();
    ctx.restore();
  }
}

export default Renderer;
