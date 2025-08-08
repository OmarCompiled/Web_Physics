// this just feels so wrong without type checking. we have to switch to TS someday
export function overlap(ball1, ball2) {
    return ball1.radius + ball2.radius - ball1.p.distTo(ball2.p);
}

export function doOverlap(ball1, ball2) {
    return ball1.p.distTo(ball2.p) < ball1.radius + ball2.radius;
}