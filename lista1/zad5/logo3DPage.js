import {WireFrame} from "../shared/WireFrame.js";
import {BetterLogo3D} from "../shared/BetterLogo3D.js";
import {KeyboardControl, MouseControl} from "../shared/Controls.js";

const speedUp = 0.2;
const slowDown = 0.1;
const maxSpeed = 30;

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

    const mouseControl = new MouseControl(canvas);
    mouseControl.addListener((x, y) => wireFrame.rotateCamera(x, y), 500, 500);

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