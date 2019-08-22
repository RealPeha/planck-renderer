const { World } = planck

class Viewer {
  constructor(options = {}) {
    const defaultOptions = {
      canvas: document.querySelector('#game'),
      world: new World(),
      width: 80,
      height: 60,
    }
    this.options = Object.assign(defaultOptions, options)

    this.step = options.step
    this.world = options.world
    this.keydown = options.keydown

    this.paused = false
    this.debug = false
    this.x = 0
    this.y = 0
    this.scaleY = -1;
    this.ratio = 16;
    this.hz = 60;
    this.speed = 1;
    this.background = "#222";
    this.renderer = new Renderer(this.world, this)
    this.keys = {}
    this.keysProxy = new Proxy(this.keys, {
      get(target, prop) {
        const keys = prop.split(',')
        if (keys.length > 1) {
          for (const key of keys) {
            if (target[key]) {
              return target[key]
            }
          }
        }
        return target[prop]
      }
    })
    this.stage = null
    this.test = null

    this.initStage()
  }

  initStage() {
    document.addEventListener('keydown', e => {
      this.keys[e.keyCode] = true
      this.keydown && this.keydown(this.keysProxy)
    })

    document.addEventListener('keyup', e => {
      delete this.keys[e.keyCode]
    })
    Stage(stage => {
      this.stage = stage
      stage.MAX_ELAPSE = 1000 / 30;

      stage.on("resume", () => {
        this.paused = false;
      });

      stage.on("pause", () => {
        this.paused = true;
      });

      let lastX = 0
      let lastY = 0;

      stage.tick(() => {
        if (lastX !== this.x || lastY !== this.y) {
          this.renderer.offset(-this.x, -this.y);
          lastX = this.x
          lastY = this.y
        }
      });

      this.renderer.tick((dt, t) => {
        if (typeof this.step === "function") {
          this.step(dt, t);
        }
      });

      stage.background(this.background);
      stage.viewbox(this.options.width, this.options.height);
      stage.pin("alignX", -0.5);
      stage.pin("alignY", -0.5);
      stage.prepend(this.renderer);
    });
  }

  resume() {
    this.stage.resume()
  }

  pause() {
    this.stage.pause()
  }

  startUpdate() {
    this.renderer.start()
  }

}

class Renderer extends Stage {
  constructor(world, options = {}) {
    super()

    const ratio = options.ratio || 16
    const defaultOptions = {
      speed: 1,
      hz: 60,
      scaleY: -1,
      ratio: ratio,
      lineWidth: 2 / ratio
    }

    this.options = Object.assign({}, defaultOptions, options)

    this.world = world;

    world.on('remove-fixture', obj => {
      obj.ui && obj.ui.remove();
    });

    world.on('remove-joint', obj => {
      obj.ui && obj.ui.remove();
    });
  }

  start() {
    const timeStep = 1 / this.options.hz;
    let elapsedTime = 0;
    this.tick(dt => {
      dt = dt * 0.001 * this.options.speed;
      elapsedTime += dt;
      while (elapsedTime > timeStep) {
        this.world.step(timeStep);
        elapsedTime -= timeStep;
      }
      this.renderWorld();
      return true;
    }, true);
  }

  renderWorld() {
    const world = this.world;
    const options = this.options;
    for (let b = world.getBodyList(); b; b = b.getNext()) {
      for (let f = b.getFixtureList(); f; f = f.getNext()) {

        if (!f.ui) {
          if (f.render && f.render.stroke) {
            options.strokeStyle = f.render.stroke;
          } else if (b.render && b.render.stroke) {
            options.strokeStyle = b.render.stroke;
          } else if (b.isDynamic()) {
            options.strokeStyle = 'rgba(255,255,255,0.9)';
          } else if (b.isKinematic()) {
            options.strokeStyle = 'rgba(255,255,255,0.7)';
          } else if (b.isStatic()) {
            options.strokeStyle = 'rgba(255,255,255,0.5)';
          }

          if (f.render && f.render.fill) {
            options.fillStyle = f.render.fill;
          } else if (b.render && b.render.fill) {
            options.fillStyle = b.render.fill;
          } else {
            options.fillStyle = '';
          }

          const type = f.getType();
          const shape = f.getShape();
          if (type === 'circle') {
            f.ui = this.drawCircle(shape);
          }
          if (type === 'edge') {
            f.ui = this.drawEdge(shape);
          }
          if (type === 'polygon') {
            f.ui = this.drawPolygon(shape);
          }
          if (type === 'chain') {
            f.ui = this.drawChain(shape);
          }

          if (f.ui) {
            f.ui.appendTo(this);
          }
        }

        if (f.ui) {
          const pos = b.getPosition()
          const angle = b.getAngle();
          if (f.ui.__lastX !== pos.x || f.ui.__lastY !== pos.y || f.ui.__lastR !== angle) {
            f.ui.__lastX = pos.x;
            f.ui.__lastY = pos.y;
            f.ui.__lastR = angle;
            f.ui.offset(pos.x, options.scaleY * pos.y);
            f.ui.rotate(options.scaleY * angle);
          }
        }

      }
    }

    for (let j = world.getJointList(); j; j = j.getNext()) {
      const a = j.getAnchorA();
      const b = j.getAnchorB();

      if (!j.ui) {
        options.strokeStyle = 'rgba(255,255,255,0.2)';

        j.ui = this.drawJoint(j, options);
        j.ui.pin('handle', 0.5);
        if (j.ui) {
          j.ui.appendTo(this);
        }
      }

      if (j.ui) {
        const cx = (a.x + b.x) * 0.5;
        const cy = options.scaleY * (a.y + b.y) * 0.5;
        const dx = a.x - b.x;
        const dy = options.scaleY * (a.y - b.y);
        const d = Math.sqrt(dx * dx + dy * dy);
        j.ui.width(d);
        j.ui.rotate(Math.atan2(dy, dx));
        j.ui.offset(cx, cy);
      }
    }

  }

  drawJoint(joint) {
    const options = this.options
    const lw = options.lineWidth;
    const ratio = options.ratio;

    const length = 10;

    const texture = Stage.canvas(function(ctx) {

      this.size(length + 2 * lw, 2 * lw, ratio);

      ctx.scale(ratio, ratio);
      ctx.beginPath();
      ctx.moveTo(lw, lw);
      ctx.lineTo(lw + length, lw);

      ctx.lineCap = 'round';
      ctx.lineWidth = options.lineWidth;
      ctx.strokeStyle = options.strokeStyle;
      ctx.stroke();
    });

    const image = Stage.image(texture).stretch();
    return image;
  };

  drawCircle(shape) {
    const options = this.options
    const lw = options.lineWidth;
    const ratio = options.ratio;

    const r = shape.m_radius;
    const cx = r + lw;
    const cy = r + lw;
    const w = r * 2 + lw * 2;
    const h = r * 2 + lw * 2;

    const texture = Stage.canvas(function(ctx) {
      this.size(w, h, ratio);

      ctx.scale(ratio, ratio);
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      if (options.fillStyle) {
        ctx.fillStyle = options.fillStyle;
        ctx.fill();
      }
      ctx.lineWidth = options.lineWidth;
      ctx.strokeStyle = options.strokeStyle;
      ctx.stroke();
    });

    const image = Stage.image(texture)
      .offset(shape.m_p.x - cx, options.scaleY * shape.m_p.y - cy);
    const node = Stage.create().append(image);
    return node;
  };

  drawEdge(edge) {
    const options = this.options
    const lw = options.lineWidth;
    const ratio = options.ratio;

    const v1 = edge.m_vertex1;
    const v2 = edge.m_vertex2;

    const dx = v2.x - v1.x;
    const dy = v2.y - v1.y;

    const length = Math.sqrt(dx * dx + dy * dy);

    const texture = Stage.canvas(function(ctx) {

      this.size(length + 2 * lw, 2 * lw, ratio);

      ctx.scale(ratio, ratio);
      ctx.beginPath();
      ctx.moveTo(lw, lw);
      ctx.lineTo(lw + length, lw);

      ctx.lineCap = 'round';
      ctx.lineWidth = options.lineWidth;
      ctx.strokeStyle = options.strokeStyle;
      ctx.stroke();
    });

    const minX = Math.min(v1.x, v2.x);
    const minY = Math.min(options.scaleY * v1.y, options.scaleY * v2.y);

    const image = Stage.image(texture);
    image.rotate(options.scaleY * Math.atan2(dy, dx));
    image.offset(minX - lw, minY - lw);
    const node = Stage.create().append(image);
    return node;
  };

  drawPolygon(shape) {
    const options = this.options
    const lw = options.lineWidth;
    const ratio = options.ratio;

    const vertices = shape.m_vertices;

    if (!vertices.length) {
      return;
    }

    let minX = Infinity
    let minY = Infinity;
    let maxX = -Infinity
    let maxY = -Infinity;
    for (const v of vertices) {
      minX = Math.min(minX, v.x);
      maxX = Math.max(maxX, v.x);
      minY = Math.min(minY, options.scaleY * v.y);
      maxY = Math.max(maxY, options.scaleY * v.y);
    }

    const width = maxX - minX;
    const height = maxY - minY;

    const texture = Stage.canvas(function(ctx) {

      this.size(width + 2 * lw, height + 2 * lw, ratio);

      ctx.scale(ratio, ratio);
      ctx.beginPath();
      for (let i = 0; i < vertices.length; ++i) {
        const v = vertices[i];
        const x = v.x - minX + lw;
        const y = options.scaleY * v.y - minY + lw;
        if (i == 0)
          ctx.moveTo(x, y);
        else
          ctx.lineTo(x, y);
      }

      if (vertices.length > 2) {
        ctx.closePath();
      }

      if (options.fillStyle) {
        ctx.fillStyle = options.fillStyle;
        ctx.fill();
        ctx.closePath();
      }

      ctx.lineCap = 'round';
      ctx.lineWidth = options.lineWidth;
      ctx.strokeStyle = options.strokeStyle;
      ctx.stroke();
    });

    const image = Stage.image(texture);
    image.offset(minX - lw, minY - lw);
    const node = Stage.create().append(image);
    return node;
  };

  drawChain(shape) {
    const options = this.options
    const lw = options.lineWidth;
    const ratio = options.ratio;

    const vertices = shape.m_vertices;

    if (!vertices.length) {
      return;
    }

    let minX = Infinity
    let minY = Infinity;
    let maxX = -Infinity
    let maxY = -Infinity;
    for (const v of vertices) {
      minX = Math.min(minX, v.x);
      maxX = Math.max(maxX, v.x);
      minY = Math.min(minY, options.scaleY * v.y);
      maxY = Math.max(maxY, options.scaleY * v.y);
    }

    const width = maxX - minX;
    const height = maxY - minY;

    const texture = Stage.canvas(function(ctx) {

      this.size(width + 2 * lw, height + 2 * lw, ratio);

      ctx.scale(ratio, ratio);
      ctx.beginPath();
      for (let i = 0; i < vertices.length; ++i) {
        const v = vertices[i];
        const x = v.x - minX + lw;
        const y = options.scaleY * v.y - minY + lw;
        if (i == 0)
          ctx.moveTo(x, y);
        else
          ctx.lineTo(x, y);
      }

      // TODO: if loop
      if (vertices.length > 2) {
        // ctx.closePath();
      }

      if (options.fillStyle) {
        ctx.fillStyle = options.fillStyle;
        ctx.fill();
        ctx.closePath();
      }

      ctx.lineCap = 'round';
      ctx.lineWidth = options.lineWidth;
      ctx.strokeStyle = options.strokeStyle;
      ctx.stroke();
    });

    const image = Stage.image(texture);
    image.offset(minX - lw, minY - lw);
    const node = Stage.create().append(image);
    return node;
  };

}

export default Viewer;
