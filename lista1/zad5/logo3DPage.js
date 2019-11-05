import {WireFrame} from "../shared/WireFrame.js";
import {BetterLogo3D} from "../shared/BetterLogo3D.js";

const speedUp = 0.3;
const slowDown = 0.2;
const maxSpeed = 50;

window.addEventListener('load', () => {
    const canvas = document.getElementById('logoCanvas');

    const wireFrame = new WireFrame(canvas, 300);

    const betterLogo = new BetterLogo3D(wireFrame);
    const commandInput = document.getElementById('commandInput');

    commandInput.addEventListener('keyup', (event) => {
        event.preventDefault();
        if (event.key === 'Enter') {
            let temp = commandInput.value;
            commandInput.value = '';
            betterLogo.runCommands(temp);
        }
    });

    document.getElementById('executeButton').addEventListener('click', () => {
        betterLogo.runCommands(commandInput.value);
    });

    let drag = false;
    canvas.addEventListener('mousedown', () => drag = true);
    canvas.addEventListener('mouseup', () => drag = false);
    canvas.addEventListener('mouseout', () => drag = false);
    canvas.addEventListener('mousemove', event => {
        if (drag) {
            wireFrame.rotate(-event.movementX/500, event.movementY/500);
            betterLogo.pitch(event.movementY/500);
            betterLogo.rotate(-event.movementX/500);
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