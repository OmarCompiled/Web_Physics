import Vec2 from "./Vec2.js";

const G = 0.5e4; // gravitational constant
let g = G; // actual gravity value being used

// "Abstract" class
class GravityMode {
    // damping
    static c = 0.85;

    // set gravity
    set() { }

    // acceleration
    getAcceleration(ball) {
        return new Vec2(0, 0);
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
    set() { g = G; }

    getAcceleration() {
        return new Vec2(0, g);
    }

    get c() {
        return super.c;
    }
}

// Zero gravity. No gravity, and fully elastic collisons.A perfectly smooth system.
// Damping: no.
// Methods of getting acceleration: none.
export class GravityModeZero extends GravityMode {
    set() { g = 0; }
    getAcceleration() {
        return new Vec2(0, 0);
    }

    get c() {
        return 1;
    }
}

// Basically "pool/billiards table" mode. Gravity is INTO the screen. Energy loss on collision.
// Damping: yes.
// Methods of getting acceleration: friction.
export class GravityModeInto extends GravityMode {
    set() { g = G; }

    getAcceleration(ball) {
        return Vec2.Scale(ball.v.normalized, -ball.mu * g);
    }

    get c() {
        return super.c;
    }
}
