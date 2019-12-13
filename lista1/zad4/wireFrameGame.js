import {WireFrame} from "../shared/WireFrame.js";
import {Cuboid} from "./shapes/basicShapes.js";

const DEGREE = Math.PI / 180;
const [speedUp, yawUp, pitchUp, rollUp] = [0.2, 0.005 * DEGREE, 0.005 * DEGREE, 0.005 * DEGREE];
const [slowDown, yawDown, pitchDown, rollDown] = [0.01, 0.001 * DEGREE, 0.001 * DEGREE, 0.001 * DEGREE];
const [maxSpeed, maxYaw, maxPitch, maxRoll] = [20, 2 * DEGREE, 2 * DEGREE, 1.5 * DEGREE];

let points = 0;

let difficulty = 500;
let size = {
    x: 5000,
    y: 5000,
    z: 10000
};

let pointsText = document.getElementById('points');

function updatePoints() {
    pointsText.textContent = `Points: ${points}`;
}

function score(value) {
    points += value;
    updatePoints();
}

function lose(value) {
    points -= value;
    updatePoints();
}

function recreateTarget(target, wireFrame, style = '#000000') {
    if (target) wireFrame.removeShape(target);
    let randomStart = {
        x: ((Math.random() - 0.5) * 2) * size.x + (Math.random() > 0.5 ? -1 : 1) * 1000,
        y: ((Math.random() - 0.5) * 2) * size.y + (Math.random() > 0.5 ? -1 : 1) * 1000,
        z: ((Math.random() - 0.5) * 2) * size.z
    };
    const newTarget = new Cuboid(randomStart, {
        x: randomStart.x + 100 + Math.random()*difficulty/5,
        y: randomStart.y + 100 + Math.random()*difficulty/5,
        z: randomStart.z + 100 + Math.random()*difficulty/5
    }, target ? target.style : style);
    wireFrame.addShapes(newTarget);
    return newTarget;
}

function respawnTarget(target, wireFrame, style = '#000000') {
    if (target) wireFrame.removeShape(target);
    let randomTarget = wireFrame.shapes[Math.floor(wireFrame.shapes.length * Math.random())].hitBox().center;
    let randomStart = {
        x: randomTarget.x + (Math.random() - 0.5) * 100,
        y: randomTarget.y + (Math.random() - 0.5) * 100,
        z: randomTarget.y + (Math.random() - 0.5) * 100
    };
    const newTarget = new Cuboid(randomStart, {
        x: randomStart.x + 100,
        y: randomStart.y + 100,
        z: randomStart.z + 100
    }, target ? target.style : style);
    wireFrame.addShapes(newTarget);
    return newTarget;
}

function distance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));
}

window.addEventListener('load', () => {
    let perspective = 500;
    const canvas = document.getElementById('wireFrameCanvas');
    const wireFrame = new WireFrame(canvas, perspective);

    canvas.getContext('2d').font = '30px Consolas';
    canvas.getContext('2d').fillText('Loading...', 0, 0);
    for (let i = 0; i < difficulty; i++) {
        setTimeout(() => {
            recreateTarget(null, wireFrame);
        }, i * 10);
    }

    let target = recreateTarget(null, wireFrame, '#0070ff');

    const controls = new KeyboardControl(window);
    let [vz, yaw, pitch, roll] = [0, 0, 0, 0];

    controls.onKey('ArrowUp', (timeFactor) => roll = Math.min(roll + rollUp * timeFactor, maxRoll));
    controls.onKey('ArrowDown', (timeFactor) => roll = Math.max(roll - rollUp * timeFactor, -maxRoll));
    controls.onKey('a', (timeFactor) => pitch = Math.min(pitch + pitchUp * timeFactor, maxPitch));
    controls.onKey('d', (timeFactor) => pitch = Math.max(pitch - pitchUp * timeFactor, -maxPitch));
    controls.onKey('ArrowLeft', (timeFactor) => yaw = Math.min(yaw + yawUp * timeFactor, maxYaw));
    controls.onKey('ArrowRight', (timeFactor) => yaw = Math.max(yaw - yawUp * timeFactor, -maxYaw));
    controls.onKey('w', (timeFactor) => vz = Math.max(vz - speedUp * timeFactor, -maxSpeed));
    controls.onKey('s', (timeFactor) => vz = Math.min(vz + speedUp / 5 * timeFactor, maxSpeed));

    let previousTimestamp = 0;
    let rerender = (timestamp) => {
        let timeFactor = timestamp - previousTimestamp;
        controls.tick(timeFactor);

        vz > 0 ? vz -= Math.min(slowDown * timeFactor, vz) : vz -= Math.max(-slowDown * timeFactor, vz);
        pitch > 0 ? pitch -= Math.min(pitchDown * timeFactor, pitch) : pitch -= Math.max(-pitchDown * timeFactor, pitch);
        yaw > 0 ? yaw -= Math.min(yawDown * timeFactor, yaw) : yaw -= Math.max(-yawDown * timeFactor, yaw);
        roll > 0 ? roll -= Math.min(rollDown * timeFactor, roll) : roll -= Math.max(-rollDown * timeFactor, roll);

        wireFrame.move(0, 0, vz);
        wireFrame.rotateCamera(pitch, roll, yaw);
        wireFrame.draw();

        for (let shape of wireFrame.shapes) {
            if (distance(shape.hitBox().center, {x: 0, y: 0, z: -perspective}) < shape.hitBox().radius) {
                if (shape === target) {
                    for (let i = 0; i < wireFrame.shapes.length; i++) {
                        let shape = wireFrame.shapes[i];
                        if (shape !== target) {
                            setTimeout(() => {
                                recreateTarget(shape, wireFrame);
                            }, i * 10);
                        } else {
                            target = recreateTarget(target, wireFrame);
                        }
                    }
                    score(50);
                    break;
                } else {
                    respawnTarget(shape, wireFrame);
                    lose(10);
                }
            }
        }

        previousTimestamp = timestamp;
        window.requestAnimationFrame(rerender);
    };
    window.requestAnimationFrame(rerender);
});
