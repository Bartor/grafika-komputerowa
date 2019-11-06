import {Line3d, WireFrame} from "../shared/WireFrame.js";
import {Cuboid} from "./shapes/basicShapes.js";

const speedUp = 0.3;
const slowDown = 0.2;
const maxSpeed = 50;

window.addEventListener('load', () => {
    let perspective = 500;

    const canvas = document.getElementById('wireFrameCanvas');
    const wireFrame = new WireFrame(canvas, perspective);

    wireFrame.addShapes(
        new Cuboid({x: 0, y: 200, z: 100}, {x: 100, y: 100, z: 200}, '#0070ff'),
        new Cuboid({x: -100, y: 200, z: 100}, {x: 0, y: 100, z: 200}),
        new Cuboid({x: -100, y: 200, z: 200}, {x: 0, y: 100, z: 300}),
        new Cuboid({x: 100, y: 200, z: 300}, {x: 0, y: 100, z: 200}),
        new Line3d({x: 0, y: 0, z: 100}, {x: 0, y: 100, z: 200}),
        new Line3d({x: 0, y: 0, z: 300}, {x: 0, y: 100, z: 200}),
        new Line3d({x: 100, y: 0, z: 200}, {x: 0, y: 100, z: 200}),
        new Line3d({x: -100, y: 0, z: 200}, {x: 0, y: 100, z: 200}),
    );

    let drag = false;
    canvas.addEventListener('mousedown', () => drag = true);
    canvas.addEventListener('mouseup', () => drag = false);
    canvas.addEventListener('mouseout', () => drag = false);
    canvas.addEventListener('mousemove', event => {
        if (drag) {
            wireFrame.rotate(-event.movementX/500, event.movementY/500);
        }
    });

    const keyMap = {};
    window.addEventListener('keydown', event => keyMap[event.key] = true);
    window.addEventListener('keyup', event => keyMap[event.key] = false);

    let previousTimestamp = 0;
    let [vx, vz] = [0, 0];

    let rerender = (timestamp) => {
        let timeFactor = timestamp - previousTimestamp;

        if (keyMap['w']) {
            vz = Math.max(vz - speedUp * timeFactor, -maxSpeed);
        } else if (keyMap['s']) {
            vz = Math.min(vz + speedUp * timeFactor, maxSpeed);
        }

        if (keyMap['d']) {
            vx = Math.max(vx - speedUp * timeFactor, -maxSpeed);
        } else if (keyMap['a']) {
            vx = Math.min(vx + speedUp * timeFactor, maxSpeed);
        }

        vz > 0 ? vz -= Math.min(slowDown*timeFactor, vz) : vz -= Math.max(-slowDown*timeFactor, vz);
        vx > 0 ? vx -= Math.min(slowDown*timeFactor, vx) : vx -= Math.max(-slowDown*timeFactor, vx);

        wireFrame.move(vx, 0, vz);
        wireFrame.draw();
        previousTimestamp = timestamp;
        window.requestAnimationFrame(rerender);
    };
    window.requestAnimationFrame(rerender);
});
