import Ticker from "./Ticker.js";

const canvas = document.querySelector("canvas");
const ctxt = canvas.getContext("2d");
// const angleMeter = document.getElementById("angle-meter"); // redacted

const gButton = document.querySelector("#g-button");
gButton.onclick = () => {
    g === 0 ? g = 0.5 : g = 0;
};

let rad = -Math.PI / 3;
let g   = 0;
let balls = [];
let mouseX, mouseY;

// MACHINE GUN!!!
const freq = 20; // shots per second
let isMouseDown = false;
let mgunActive = false;
const machineGunTicker = new Ticker({ freq }); // returns true freq times per second

class ball {
    constructor(angle, x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15; // arbitrary, could be changed
        this.c = 0.8 // damping coefficient
        this.speed = 7;
        this.mass = this.radius;
        this.dx = Math.cos(angle) * this.speed; // velocities
        this.dy = Math.sin(angle) * this.speed;
    }

    // this function should be called inside render
    move() {
        this.dy += g;
        this.x += this.dx;
        this.y += this.dy;
    }

    // called in render as well
    draw() {
        ctxt.beginPath();
        ctxt.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctxt.fillStyle = "black";
        ctxt.fill();
    }

    wallCollision() {
        if(this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius; // very important to prevent clipping
            this.dx *= -1; // inverting velocity vector direction
            this.dx *= this.c; // damping/friction
            this.dy *= this.c; // basically velocity decreases gradually
        } else if(this.x - this.radius < 0) {
            this.x = this.radius; // important to allow ball to stop and prevent clipping
            this.dx *= -1;
            this.dx *= this.c;
            this.dy *= this.c;
        } else if(this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.dy *= -1;
            this.dx *= this.c;
            this.dy *= this.c;
        } else if(this.y - this.radius < 0) {
            this.y = this.radius;
            this.dy *= -1;
            this.dx *= this.c;
            this.dy *= this.c;
        }
    }
}

// function hitBorders(ball) {
//     if(ball.x + ball.radius > canvas.width
//     || ball.x - ball.radius < 0
//     || ball.y + ball.radius > canvas.height
//     || ball.y - ball.radius < 0
//     ) {

//         return true;
//     }
// }
// deprecated function

canvas.addEventListener("mousemove", (e) => {
    if (isMouseDown) setMouse(e);
});

canvas.addEventListener("mousedown", async (e) => {
    setMouse(e);
    balls.push(new ball(rad, mouseX, mouseY));

    isMouseDown = true;

    await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s. todo: make a utils folder with a custom timer function someday

    if (isMouseDown) mgunActive = true; // yeahhhh

});

document.addEventListener("mouseup", () => {
    isMouseDown = false;
    mgunActive = false;
});

canvas.addEventListener("mouseleave", () => {
    isMouseDown = false;
    mgunActive = false;
})

document.addEventListener("wheel", (e) => {
    const weight = e.deltaY > 0 ? 1 : -1;
    rad += weight * 0.2;
});

function setMouse(e) {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
}

function render() {
    requestAnimationFrame(render);
    // clearing; very important, otherwise it'll draw a line not a circle.
    ctxt.clearRect(0, 0, canvas.width, canvas.height);

    if (mgunActive && machineGunTicker.tick()) {
        balls.push(new ball(rad, mouseX, mouseY));
    }

    balls.forEach(ball => {
        ball.move(); // moving first to init dx & dy

        ball.wallCollision();

        ball.draw();
    }); 
}

render();