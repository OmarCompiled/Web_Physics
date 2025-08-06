/*
    an alternative to performance.now() is the time passed by requestAnimationFrame into render, but it's
    almost the same based on what I've found. more research needed...
*/

export default class Ticker {
    constructor({ seconds = null, freq = null }) {

        // seconds: returns true every "seconds" seconds
        // freq: returns true "freq" times per second
        // pass only one. seconds takes precedence if both are passed

        if (seconds !== null) {
            this.interval = seconds * 1000;
        } 

        else if (freq !== null) {
            this.interval = (1 / freq) * 1000;
        }

        else {
            throw new Error("Ticker needs either seconds or freq.");
        }

        this.lastTime = performance.now();
    }

    // passing time in case we resort to the requestAnimationFrame's time in the future
    tick(now = performance.now()) {
        if (now - this.lastTime >= this.interval) {
            this.lastTime = now;
            return true;
        }
        return false;
    }
}

