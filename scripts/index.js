const canvas = document.querySelector("canvas");
const ctxt = canvas.getContext("2d");

let balls = [];

class ball {
    constructor(angle, x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15; // arbitrary, could be changed
        this.mass = this.radius;
        this.dx = Math.cos(angle) * 6; // velocities
        this.dy = Math.sin(angle) * 6;
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;
    }

    draw() {
        ctxt.save();
        ctxt.beginPath();
        ctxt.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctxt.fillStyle = "red";
        ctxt.fill();
    }
}

canvas.addEventListener("click", (e)=> {
    balls.push(new ball(Math.PI/2, e.offsetX, e.offsetY));
});

function render() {
    requestAnimationFrame(render);
    ctxt.clearRect(0, 0, canvas.width, canvas.height);

    balls.forEach(ball => {
        ball.move();
        ball.draw();
}); 
}

render();