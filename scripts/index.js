const canvas = document.querySelector("canvas");
const ctxt = canvas.getContext("2d");
const angleMeter = document.getElementById("angle-meter");

let rad = -Math.PI / 3;
let g   = 0.5;
let balls = [];

class ball {
    constructor(angle, x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15; // arbitrary, could be changed
        this.c = 0.8 // damping coefficient
        this.mass = this.radius;
        this.dx = Math.cos(angle) * 7; // velocities
        this.dy = Math.sin(angle) * 7;
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

canvas.addEventListener("click", (e)=> {
    balls.push(new ball(rad, e.offsetX, e.offsetY));
});

document.addEventListener("wheel", () => {
    rad += 0.1;
});

function render() {
    requestAnimationFrame(render);
    // clearing; very important, otherwise it'll draw a line not a circle.
    ctxt.clearRect(0, 0, canvas.width, canvas.height);

    balls.forEach(ball => {
        ball.move(); // moving first to init dx & dy

        ball.wallCollision();

        ball.draw();
    }); 

}

render();