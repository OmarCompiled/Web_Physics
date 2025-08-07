import Ticker from "./utils/Ticker.js";
import Vec2 from "./utils/Vec2.js";
import { doOverlap, overlap } from "./utils/overlap.js";

const canvas = document.querySelector("canvas");
const ctxt = canvas.getContext("2d");

const gButton = document.querySelector("#g-button");
const cButton = document.querySelector("#c-button");

gButton.onclick = () => {
    g === 0 ? g = 0.5 : g = 0;
};

cButton.onclick = () => {
    balls = [];
}

let rad = -Math.PI / 3;
let g = 0;
let balls = [];
let mouseX, mouseY;

// MACHINE GUN!!!
const freq = 20; // shots per second
let isMouseDown = false;
let mgunActive = false;
let mgunTimer;
const machineGunTicker = new Ticker({ freq }); // returns true freq times per second

class ball {
    constructor(angle, x, y) {
        this.p = new Vec2(x, y); // position vector
        this.radius = 15; // arbitrary, could be changed
        this.c = 0.8 // damping coefficient
        this.speed = 7;
        this.mass = this.radius;
        this.v = (new Vec2(Math.cos(angle), Math.sin(angle))).scale(this.speed); // velocity vector
    }

    // this function should be called inside render
    move() {
        this.v.y += g;
        this.p.add(this.v);
    }

    // called in render as well
    draw() {
        ctxt.beginPath();
        ctxt.arc(this.p.x, this.p.y, this.radius, 0, 2 * Math.PI);
        ctxt.fillStyle = "black";
        ctxt.fill();
    }

    wallCollision() {
        if (this.p.x + this.radius > canvas.width) {
            this.p.x = canvas.width - this.radius; // very important to prevent clipping
            this.v.x *= -1; // inverting velocity vector direction
        } else if (this.p.x - this.radius < 0) {
            this.p.x = this.radius; // important to allow ball to stop and prevent clipping
            this.v.x *= -1;
        } else if (this.p.y + this.radius > canvas.height) {
            this.p.y = canvas.height - this.radius;
            this.v.y *= -1;
        } else if (this.p.y - this.radius < 0) {
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
    setMouse(e); // in case the mouse never moved before clicking
    balls.push(new ball(rad, mouseX, mouseY));

    isMouseDown = true;

    // wait 1s. if still holding the mouse down, fire.
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
    clearTimeout(mgunTimer);
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

function render() {
    requestAnimationFrame(render);
    // clearing; very important, otherwise it'll draw a line not a circle.
    ctxt.clearRect(0, 0, canvas.width, canvas.height);

    if (mgunActive && machineGunTicker.tick()) {
        balls.push(new ball(rad, mouseX, mouseY));
    }

    balls.forEach(ball => ball.move()); // moving first to init dx & dy
    ballCollision();
    balls.forEach(ball => {
        ball.wallCollision();
        ball.draw();
    });
}

render();