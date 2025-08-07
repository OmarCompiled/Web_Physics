import Ticker from "./utils/Ticker.js";
import Vec2 from "./utils/Vec2.js";
import { doOverlap } from "./utils/overlap.js";

const canvas = document.querySelector("canvas");
const ctxt = canvas.getContext("2d");

const gButton = document.querySelector("#g-button");
const cButton = document.querySelector("#c-button");

gButton.onclick = () => {
    g === 0 ? g = G : g = 0;
    balls.forEach(ball => ball.a.y = g);
};

cButton.onclick = () => {
    balls = [];
}

let rad = -Math.PI / 3;
const G = 2e4; // gravitational constant
let g = G; // actual gravity value being used
let balls = [];
let mouseX, mouseY;

// MACHINE GUN!!!
const freq = 20; // shots per second
let isMouseDown = false;
let mgunActive = false;
let mgunTimer;
const machineGunTicker = new Ticker({ freq }); // returns true freq times per second

let lastTime = 0;

class ball {
    constructor(angle, x, y) {
        this.p = new Vec2(x, y); // position vector
        this.radius = 15; // arbitrary, could be changed
        this.c = 0.85 // damping coefficient
        this.speed = 900;
        this.mass = this.radius;
        this.v = (new Vec2(Math.cos(angle), Math.sin(angle))).scale(this.speed); // velocity vector
        this.a = new Vec2(0, g);
    }

    // this function should be called inside render
    move(delta) {
        this.v.add(Vec2.Scale(this.a, delta)); // v += a * dt
        this.p.add(Vec2.Scale(this.v, delta)); // p += v * dt
    }

    // called in render as well
    draw() {
        ctxt.beginPath();
        ctxt.arc(this.p.x, this.p.y, this.radius, 0, 2 * Math.PI);
        ctxt.fillStyle = "black";
        ctxt.fill();
    }

    wallCollision() {
        if (this.p.x + this.radius > canvas.width) { // right
            this.p.x = canvas.width - this.radius; // very important to prevent clipping
            this.v.x *= -1; // inverting velocity vector direction
        } else if (this.p.x - this.radius < 0) { // left
            this.p.x = this.radius; // important to allow ball to stop and prevent clipping
            this.v.x *= -1;
        } else if (this.p.y + this.radius > canvas.height) { // up
            this.p.y = canvas.height - this.radius;
            this.v.y *= -1;
        } else if (this.p.y - this.radius < 0) { // down
            this.p.y = this.radius;
            this.v.y *= -1;
        }
        else return;

        this.v.scale(this.c); // damping/friction. basically velocity decreases gradually. applied in all listed cases.
    }
}

canvas.addEventListener("mousemove", (e) => {
    if (isMouseDown) setMouse(e);
});

canvas.addEventListener("mousedown", (e) => {
    setMouse(e); // In case the mouse never moved before clicking
    balls.push(new ball(rad, mouseX, mouseY)); // Initial shot

    isMouseDown = true;

    // Wait 1s. If still holding the mouse down, activate machine gun.
    mgunTimer = setTimeout(() => {
        mgunActive = isMouseDown;
    }, 1000);
});

document.addEventListener("mouseup", () => {
    resetMgun();
});

canvas.addEventListener("mouseleave", () => {
    resetMgun();
})

function resetMgun() {
    isMouseDown = false;
    mgunActive = false;
    clearTimeout(mgunTimer); // Clear the 1s mouse hold timer
}

document.addEventListener("wheel", (e) => {
    const weight = e.deltaY > 0 ? 1 : -1;
    rad += weight * 0.2;
});

function setMouse(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
}

function ballCollision() {
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const ball1 = balls[i], ball2 = balls[j];
            if (doOverlap(ball1, ball2)) {
                // The new velocity of each ball is in the direction of the line connecting their centers.
                // The balls are propelled in opposite directions.
                // Will implement actual physics soon.
                // Summary: C2 - C1 gives us vector C1C2, it's normalized, then scaled by the magnitude.
                const mag = 4;
                const dir = Vec2.DirTo(ball1.p, ball2.p).scale(mag);
                const offset = Vec2.Scale(dir, ball1.radius);

                ball1.p.add(offset);
                ball2.p.sub(offset);

                ball1.v.set(dir);
                ball2.v.set(Vec2.Scale(dir, -1));
            }
        }
    }
}

// Game logic
function update(delta) {
    // If the user is currently shooting and the current tick/frame is a shooting one, shoot.
    if (mgunActive && machineGunTicker.tick()) {
        balls.push(new ball(rad, mouseX, mouseY));
    }

    balls.forEach(ball => ball.move(delta)); // moving first to init dx & dy
    // ballCollision();
    balls.forEach(ball => {
        ball.wallCollision();
        ball.draw();
    });
}

function render(now) {
    // Delta (seconds since the last frame) is capped at 50ms.
    // If you switch between tabs while the site is running, render doesn't run at all; yet time keeps running.
    // So when you come back, delta will be HUGE which will cause sudden movements like big jumps.
    // Capping it at 50ms means no physics frame will go longer than 50ms.
    // For reference, on 60fps, a frame takes 16.67ms.
    let delta = (now - lastTime) / 1000; 
    delta = Math.min(0.05, delta);
    lastTime = now;

    // clearing; very important, otherwise it'll draw a line not a circle.
    ctxt.clearRect(0, 0, canvas.width, canvas.height);

    // Update game logic
    update(delta)
    requestAnimationFrame(render);
}

render();