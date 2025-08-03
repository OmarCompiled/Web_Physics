const canvas = document.querySelector("canvas");
const ctxt = canvas.getContext("2d");
const angleMeter = document.getElementById("angle-meter");

let rad = 0;
let balls = [];

class ball {
    constructor(angle, x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15; // arbitrary, could be changed
        this.mass = this.radius;
        this.dx = Math.cos(angle) * 6; // velocities
        this.dy = Math.sin(angle) * 9.8;
    }

    // this function should be called inside render
    move() {
        this.x += this.dx;
        this.y += this.dy;
    }

    // called in render as well
    draw() {
        ctxt.save();
        ctxt.beginPath();
        ctxt.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctxt.fillStyle = "red";
        ctxt.fill();
        setTimeout(1000);
    }
}

function hitBorders(ball) {
    if(ball.x + ball.radius > canvas.width
    || ball.x - ball.radius < 0
    || ball.y + ball.radius > canvas.height
    || ball.y - ball.radius < 0
    ) {
        return true;
    }
}

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
        if(!hitBorders(ball)) {ball.move();}
        ball.draw();
    }); 

    angleMeter.innerHTML = rad;
}

render();