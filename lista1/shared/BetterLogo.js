/**
 * Author: Bartosz Barnaba Rajczyk
 */

import {ExecutionContext} from "./ExecutionContext.js";

const COMMAND_SEPARATOR = ' ';
/***
 * 2D BetterLogo implementation for canvas.
 */
export class BetterLogo {
    get is3D() { return false; }

    constructor(canvasDomElement) {
        this.ctx = canvasDomElement.getContext('2d');
        this.height = canvasDomElement.height;
        this.width = canvasDomElement.width;

        this.x = 0;
        this.y = 0;
        this.rotation = 90;
        this.stroke = true;
    }

    move(value) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y + this.height);
        this.x += value * Math.cos(this.rotation * Math.PI/180);
        this.y -= value * Math.sin(this.rotation * Math.PI/180);
        this.ctx.lineTo(this.x, this.y + this.height);
        if (this.stroke) this.ctx.stroke();
    }

    rotate(value) {
        this.rotation = ((this.rotation - value) % 360 + 360) % 360;
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

    getCoords() {
        return {
            x: this.x,
            y: -this.y,
            r: this.rotation
        };
    }
}