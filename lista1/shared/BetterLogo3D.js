/**
 * 3D BetterLogo implementation to work with WireFrame.
 */
import {Line3d} from "./WireFrame.js";
import {ExecutionContext} from "./ExecutionContext.js";

const COMMAND_SEPARATOR = ' ';

export class BetterLogo3D {
    get is3D() {
        return true;
    }

    constructor(wireFrame) {
        this.wireFrame = wireFrame;
        this.position = {
            x: 0,
            y: 0,
            z: 0
        };

        this.stroke = true;
        this.wireFrame.addShapes(this);

        [this.rotation, this.pitchRotation] = [0, 0];
    }

    move(value) {
        const start = {...this.position};
        this.position.z += value * Math.cos(this.pitchRotation * Math.PI / 180) * Math.cos(this.rotation * Math.PI / 180);
        this.position.x += value * Math.cos(this.pitchRotation * Math.PI / 180) * Math.sin(this.rotation * Math.PI / 180);
        this.position.y += value * Math.sin(this.pitchRotation * Math.PI / 180) * Math.cos(this.rotation * Math.PI / 180);

        if (this.stroke) this.wireFrame.addShapes(new Line3d(start, {...this.position}));
    }

    rotate(value) {
        this.rotation = ((this.rotation + value) % 360 + 360) % 360;
    }

    pitch(value) {
        this.pitchRotation = ((this.pitchRotation + value) % 360 + 360) % 360;
    }

    toLines() {
        return [];
    }

    toMove() {
        return [this.position];
    }

    runCommands(inputString) {
        const argList = inputString
            .replace(/\s+/g, ' ') // replace multiple spaces/tabs with single space
            .trim() // removes trailing spaces
            .toLocaleUpperCase() // commands are in uppercase
            .split(COMMAND_SEPARATOR);
        const context = new ExecutionContext(argList);
        context.getAtomics().forEach(atomic => atomic.execute(this));
    }
}