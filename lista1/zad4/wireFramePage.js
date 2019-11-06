import {Line3d, WireFrame} from "../shared/WireFrame.js";
import {Cuboid} from "./shapes/basicShapes.js";
import {KeyboardControl, MouseControl} from "../shared/Controls.js";

const speedUp = 0.3;
const slowDown = 0.2;
const maxSpeed = 50;

window.addEventListener('load', () => {
    let perspective = 1000;

    const canvas = document.getElementById('wireFrameCanvas');
    const wireFrame = new WireFrame(canvas, perspective);

    let toRemove = new Cuboid({x: 0, y: 200, z: 100}, {x: 100, y: 100, z: 200}, '#0070ff');

    wireFrame.addShapes(
        new Cuboid({x: -100, y: 200, z: 100}, {x: 0, y: 100, z: 200}),
        new Cuboid({x: -100, y: 200, z: 200}, {x: 0, y: 100, z: 300}),
        new Cuboid({x: 100, y: 200, z: 300}, {x: 0, y: 100, z: 200}),
        new Cuboid({x: -10000, y: -10000, z: -10000}, {x: 10000, y: 10000, z: 10000}),
        new Line3d({x: 0, y: 0, z: 100}, {x: 0, y: 100, z: 200}),
        new Line3d({x: 0, y: 0, z: 300}, {x: 0, y: 100, z: 200}),
        new Line3d({x: 100, y: 0, z: 200}, {x: 0, y: 100, z: 200}),
        new Line3d({x: -100, y: 0, z: 200}, {x: 0, y: 100, z: 200}),
        toRemove,
    );

    setTimeout(() => {
        wireFrame.removeShape(toRemove);
    }, 2000);

    const mouseControl = new MouseControl(canvas);
    mouseControl.addListener((x, y) => wireFrame.rotate(x, y), 500, 500);

    const controls = new KeyboardControl(window);
    let [vx, vz] = [0, 0];

    controls.onKey('w', (timeFactor) => vz = Math.max(vz - speedUp * timeFactor, -maxSpeed));
    controls.onKey('s', (timeFactor) => vz = Math.max(vz + speedUp * timeFactor, -maxSpeed));
    controls.onKey('d', (timeFactor) => vx = Math.max(vx - speedUp * timeFactor, -maxSpeed));
    controls.onKey('a', (timeFactor) => vx = Math.max(vx + speedUp * timeFactor, -maxSpeed));

    let previousTimestamp = 0;
    let rerender = (timestamp) => {
        let timeFactor = timestamp - previousTimestamp;
        controls.tick(timeFactor);

        vz > 0 ? vz -= Math.min(slowDown*timeFactor, vz) : vz -= Math.max(-slowDown*timeFactor, vz);
        vx > 0 ? vx -= Math.min(slowDown*timeFactor, vx) : vx -= Math.max(-slowDown*timeFactor, vx);

        wireFrame.move(vx, 0, vz);
        wireFrame.draw();
        previousTimestamp = timestamp;
        window.requestAnimationFrame(rerender);
    };
    window.requestAnimationFrame(rerender);
});
