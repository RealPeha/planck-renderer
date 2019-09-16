class Runner {
    constructor(world, options = {}) {
        const defaultOptions = {
            fps: 60,
            speed: 1,
        };
        this.options = Object.assign(defaultOptions, options);
        this.world = world

        this.fps = 0

        this.runId = null
        this.render = null
        this.update = null
    }
    start(render = false, update = false) {
        if (this.runId) {
            return
        }
        if (render) {
            this.render = render
        }
        if (update) {
            this.update = render
        }
        const step = 1 / this.options.fps;
        const slomo = 1 / this.options.speed;
        const slowStep = slomo * step;
        let last = performance.now();
        let dt = 0;
        let now;
        let delta;

        const tick = () => {
            now = performance.now();
            dt = dt + Math.min(1, (now - last) / 1000);
            while (dt > slowStep) {
                this.world.step(step);
                if (typeof update === 'function') {
                    this.update(step)
                }
                dt -= slowStep;
            }
            delta = (now - last) / 1000
            this.fps = 1 / delta
            last = now;

            this.render();
            this.runId = requestAnimationFrame(tick);
        };

        this.runId = requestAnimationFrame(tick);
    }

    stop() {
        if (this.runId) {
            cancelAnimationFrame(this.runId)
            this.runId = null
        }
    }
}

export { Runner }
