import Vec2 from "./Vec2.js";

const G = 0.5e4; // gravitational constant

// "Abstract" class
class GravityMode {
    // damping
    static c = 0.85;

    // mode-specific actions done on switching to a new gravity mode.
    init(ball) {
        // generally, just set damping and acceleration.
        ball.c = GravityMode.c;
        ball.setAcceleration();
    }
    
    // mode-specific actions done in the gameplay loop (called in index.js's update function)
    update() {}

    // acceleration
    getAcceleration() {
        return Vec2.Z;
    }

    // damping
    get c() {
        return GravityMode.c;
    }
}

// Regular gravity mode. Balls fall down normally and lose energy on collision.
// Damping: yes.
// Methods of getting acceleration: gravity.
export class GravityModeDown extends GravityMode {
    getAcceleration() {
        return new Vec2(0, G);
    }

    get c() {
        return super.c;
    }
}

// Zero gravity. No gravity, and fully elastic collisons.A perfectly smooth system.
// Damping: no.
// Methods of getting acceleration: none.
export class GravityModeZero extends GravityMode {
    getAcceleration() {
        return Vec2.Z;
    }

    get c() {
        return 1;
    }
}

// Basically "pool/billiards table" mode. Gravity is INTO the screen. Energy loss on collision.
// Damping: yes.
// Methods of getting acceleration: friction.
export class GravityModeTable extends GravityMode {
    getAcceleration(ball) {
        return Vec2.Scale(ball.v.normalized, -ball.mu * G);
    }

    get c() {
        return super.c;
    }
}
