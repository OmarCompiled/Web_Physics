export default class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  // ---- STATIC ---- //

  static Add(v1, v2) {
    return new Vec2(v1.x + v2.x, v1.y + v2.y);
  }

  static Sub(v1, v2) {
    return new Vec2(v1.x - v2.x, v1.y - v2.y);
  }

  static Scale(v, s) {
    return new Vec2(v.x * s, v.y * s);
  }

  // Returns the distance between two vectors
  static DistTo(v1, v2) {
    return Math.hypot(v1.x - v2.x, v1.y - v2.y);
  }

  // Returns the normalized direction vector v1v2
  static DirTo(v1, v2) {
    return this.Sub(v2, v1).normalized;
  }

  // Returns a clockwise or counterclockwise tangential vector
  static Tangent(v, ccw = true) {
    return ccw ? new Vec2(-v.y, v.x) : new Vec2(v.y, -v.x);
  }

  // Returns the dot product of two vectors
  static Dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }

  // ---- MUTATING ---- //

  // Add two vec2s
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  // Subtract two vec2s
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
    const len = this.length;
    if (len === 0) return new Vec2(0, 0);
    return this.clone().scale(1 / len);
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
