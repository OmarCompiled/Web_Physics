import Ticker from "./utils/Ticker.js";
import Vec2 from "./utils/Vec2.js";
import { doOverlap, overlap } from "./utils/overlap.js";

const canvas = document.querySelector("canvas");
const ctxt = canvas.getContext("2d");

const gButton = document.querySelector("#g-button");
const cButton = document.querySelector("#c-button");
const edgeButton = document.querySelector("#edge-button");

gButton.onclick = () => {
    g === 0 ? g = G : g = 0;
    balls.forEach(ball => ball.a.y = g);
};

cButton.onclick = () => {
    balls = [];
}

edgeButton.onclick = () => {
    mode == "edge" ? mode = "ball" : mode = "edge";
    edgeButton.value = mode;
};

let rad = -Math.PI / 3;
let mode = "edge";
const G = 0.5e4; // gravitational constant
let g = G; // actual gravity value being used
let balls = [];
let edges = [];
let mouseX, mouseY;

// MACHINE GUN!!!
const freq = 5; // shots per second
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
        this.speed = 1e3;
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
        // now checks corner collisions as well (horizontal + vertical walls simultaneously)
        // a needed change thanks to ball collisions
        const floor = canvas.height - this.radius;
        const ceiling = this.radius;
        const right = canvas.width - this.radius;
        const left = this.radius;

        // right and up
        if (this.p.x > right) {
            this.p.x = right;
            this.v.x *= -1;
        } else if (this.p.x < left) {
            this.p.x = left;
            this.v.x *= -1;
        }

        // down and up
        if (this.p.y > floor) {
            this.p.y = floor;
            this.v.y *= -1;
        } else if (this.p.y < ceiling) {
            this.p.y = ceiling;
            this.v.y *= -1;
        }
        else return;

        this.v.scale(this.c);
    }
}

// couldn't seperate into new file since we need ctxt and canvas :/
class edge { // this inheritence is just for testing, since I'm having trouble
    // with the rendering :)
    constructor(v1, v2) {
        this.startV = v1; // starting point and ending point vectors
        this.endV = v2;
    }
    draw() {
        ctxt.strokeStyle = "black";
        ctxt.lineWidth = 10;
        ctxt.beginPath();
        ctxt.moveTo(this.startV.x, this.startV.y);
        ctxt.lineTo(this.endV.x, this.endV.y);
        ctxt.stroke();
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

function edgeCollision() {
    for(let i = 0; i < balls.length; i++) {
        for(let j = 0; j < edges.length; j++) {
            const currBall = balls[i], currEdge = edges[j];
            let edgeDir = Vec2.Sub(currEdge.endV, currEdge.startV);
            let AC = Vec2.Sub(currBall.p, currEdge.startV);
            let t = Vec2.Dot(edgeDir, AC) / (Vec2.Dot(edgeDir, edgeDir)); // closest point to edge
            t > 1 ? t = 1 : t = t;
            t < 0 ? t = 0 : t = t; // have to clamp t or the collision extends infinitely
            // review rays and parmeterized rays (basically r(t) = S + t*d)
            let P = Vec2.Add(currEdge.startV, (Vec2.Scale(edgeDir, t)));
            let distance = Vec2.DistTo(currBall.p, P);
            if(distance <= currBall.radius) {   
                // I'll have to use the reflection formula
                let normal = new Vec2(-edgeDir.y, edgeDir.x);
                let n = normal.normalized;
                let reflectedV = Vec2.Sub(currBall.v, Vec2.Scale(n, 2*Vec2.Dot(currBall.v, n)));
                currBall.v = reflectedV;
            }
        }
    }
}

function ballCollision() {
    // Used for loops to skip unnecessary iterations. Trying to improve performance as much as possible.
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const ball1 = balls[i], ball2 = balls[j];
            if (doOverlap(ball1, ball2)) {
                /*
                    Core idea: the velocity is projected into two components: Vt; in the direction of the tangent to the collision,
                    and Vn; in the direction of the normal to the collision. This is possible; since the tangent and normal are
                    perpendicular to each other (obviously).

                    After the collision, the tangential component is NOT affected; only the normal one is. So that's what we calculate
                    using the elastic collision formula.

                    After we get the updated normal vector, since we already had the tangential component anyway, we just add them
                    up to obtain the new resultant velocity.
                */


                /*
                        1. Obtain the tangent and normal direction vectors.
               
                    Both are normalized directions; just unit vectors and NOT the full projections. Yet...
                */

                const normal = Vec2.Sub(ball2.p, ball1.p).normalized; // Connecting the centers of the balls.
                const tangent = Vec2.Tangent(normal); // Collision tangent.

                /*
                        2. Resolve overlap

                    Since we aren't dealing with actual solid objects, the balls unfortunately overlap.
                    This function uses real life physics, which assume objects don't, well, overlap.
                    To solve that issue, we just give each ball a push in opposite directions (along the normal)
                    with equal distances (overlap / 2) which makes them perfectly tangential. Can be made clear 
                    with a figure.
                */

                const offset = overlap(ball1, ball2) / 2;
                const correction = Vec2.Scale(normal, offset);
                ball1.p.sub(correction);
                ball2.p.add(correction);

                /*
                        3. Calculating dot products for later use.
                
                      We need them for this formula: v_direction = (v . d) * d
                      This formula caluclates the projection of vector v onto the unit vector/direction d.
                      v is the vector we're decomposing, d is a unit vector in the direction we want,
                      v . d is their dot product, and * scales the vector d.
              */

                const v1n = Vec2.Dot(normal, ball1.v);
                const v1t = Vec2.Dot(tangent, ball1.v);

                const v2n = Vec2.Dot(normal, ball2.v);
                const v2t = Vec2.Dot(tangent, ball2.v);

                /*
                        4. Calculate the new scalar projections onto the normal based on the elastic formula deduced from
                        the law of conservation of momentum.

                    This assumes elastic collision with no loss in energy. (we add fake energy loss with damping later)

                    The new tangential component is never computed because, again, it isn't even affected by the collision; 
                    only the normal component is.
                */

                const m1 = ball1.mass;
                const m2 = ball2.mass;

                const v1nAfter = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
                const v2nAfter = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

                /*
                        5. V = v_t + v_n

                    resultant velocity vector after collision = unchanged tangential vector + changed normal vector
                    Where, again, v_direction = (v . d) * d

                    => v_t = vt * t
                    tangent component = the dot product we got ages ago (like 10 lines ago) * unit tangent direction vector.
                    we could've calculated this a while ago; because it never even changed.
                    It's just here to group everything in a way that makes sense.

                    => v_n = vn * t
                    NEW normal component = the NEW scalar projection onto the normal * normal unit vector
                    we can finally calculate this now; as it doesn't use the old scalar projection (aka dot product), but
                    the ones from the elastic collision formula (that we've only just calculated).

                    Add those two together, and you finally get V.
                */

                ball1.v.set(Vec2.Scale(tangent, v1t).add(Vec2.Scale(normal, v1nAfter)));
                ball2.v.set(Vec2.Scale(tangent, v2t).add(Vec2.Scale(normal, v2nAfter)));

                // Mimic energy loss with damping.
                ball1.v.scale(ball1.c);
                ball2.v.scale(ball2.c);
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

    edges.forEach(edge => edge.draw());

    balls.forEach(ball => ball.move(delta)); // moving first to init dx & dy
    ballCollision();
    edgeCollision();
    balls.forEach(ball => {
        ball.wallCollision();
        ball.draw();
    });
}

let testEdge1 = new edge(new Vec2(100, 100), new Vec2(100, 600));
let testEdge2 = new edge(new Vec2(500, 500), new Vec2(1000, 1000));
edges.push(testEdge1, testEdge2);
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