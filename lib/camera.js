class Camera {
  constructor(viewer, initPos) {
    this.viewer = viewer
    this.fixed = false
    this.speed = 0
    if (initPos) {
      this.moveTo(initPos.x, initPos.y)
    }
  }

  // optimal: 0 >= speed <= 1
  setSmooth(speed) {
    this.speed = speed
  }

  moveTo(x, y) {
    if (this.speed === 0) {
      x && (this.viewer.x = x)
      y && (this.viewer.y = y)
      return
    }

    const dx = x - this.viewer.x
    const dy = y - this.viewer.y
    const max = Math.max(Math.abs(dx), Math.abs(dy))

    const distance = Math.sqrt(
      (x - this.viewer.x) ** 2 + (y - this.viewer.y) ** 2
    )
    if (Math.floor(distance) === 0) {
      return
    }

    this.viewer.x += dx / max * this.speed
    this.viewer.y += dy / max * this.speed
  }

  lockIn(x, y) {
    this.moveTo(x, y)
    this.fixed = true
  }

  unlock() {
    this.fixed = false
  }

  follow(target, offset = 0) {
    if (this.fixed) {
      return
    }
    let x
    let y
    if (target.y > this.viewer.y + offset) {
      y = -target.y + offset
    } else if (target.y < this.viewer.y - offset) {
      y = -target.y - offset
    }

    if (target.x > this.viewer.x + offset) {
      x = target.x - offset
    } else if (target.x < this.viewer.x - offset) {
      x = target.x + offset
    }
    this.moveTo(x, y)
  }
}

export { Camera }
