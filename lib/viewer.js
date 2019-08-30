const { World } = planck

class Viewer {
  constructor(options = {}) {
    const defaultOptions = {
      world: new World(),
      width: 80,
      height: 60,
      background: '#222',
      scaleY: -1,
      ratio: 16,
      hz: 60,
      speed: 1,
      debug: false,
      globalStrokeStyle: {
        dynamic: 'rgba(255, 255, 255, 0.9)',
        kinematic: 'rgba(255, 255, 255, 0.7)',
        static: 'rgba(255, 255, 255, 0.5)',
      },
      globalFillStyle: '',
    }
    const strokeStyles = Object.assign(defaultOptions.globalStrokeStyle, options.globalStrokeStyle || {})
    this.options = Object.assign(defaultOptions, options, {globalStrokeStyle: strokeStyles})

    this.step = options.step
    this.world = options.world
    this.keydown = options.keydown
    this.canvas = null
    this.stage = null
    this.camera = null
    this.isReady = false
    this.ready = () => this.isReady = true

    this.paused = false
    this.x = 0
    this.y = 0
    
    this.renderer = new Renderer(this.world, this.options)
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
    Stage((stage, canvas) => {
      this.stage = stage
      this.canvas = canvas
      stage.MAX_ELAPSE = 1000 / 30

      stage.on("resume", () => {
        this.paused = false
      })

      stage.on("pause", () => {
        this.paused = true
      })

      let lastX = 0
      let lastY = 0

      stage.tick(() => {
        if (lastX !== this.x || lastY !== this.y) {
          this.renderer.offset(-this.x, -this.y)
          lastX = this.x
          lastY = this.y
        }
      });

      this.renderer.tick((dt, t) => {
        if (typeof this.step === "function" && this.isReady) {
          this.step(dt, t)
        }
      });

      stage.background(this.options.background);
      stage.viewbox(this.options.width, this.options.height);
      stage.pin("alignX", -0.5)
      stage.pin("alignY", -0.5)
      stage.prepend(this.renderer)
      this.camera = new Camera(this)
      this.isReady = this.ready()
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

export default Viewer

export { Viewer }
