export default class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  // Add two vec2s
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  // Multiply by a scalar
  scale(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  // Set to a new vector
  set(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  // Get distance to a new vector
  distTo(v) {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }

  // Get the normalized vector
  get normalized() {
    return this.clone().scale(1 / this.length); // to prevent mutating the original vec with this.scale()
  }

  // Get the angle the vector makes with the x-axis
  get angle() {
    return Math.atan2(this.y, this.x);
  }
  
  // Get the magnitude of the vector
  get length() {
    return Math.hypot(this.x, this.y);
  }
  
  // Make a copy of the vector
  clone() {
    return new Vec2(this.x, this.y);
  }
}
