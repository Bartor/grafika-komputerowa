import {Line3d} from "../../shared/WireFrame.js";

export class Cuboid {
    constructor(start, end, style = '#000000') {
        this.box = {
            center: {
                x: start.x + (end.x - start.x) / 2,
                y: start.y + (end.y - start.y) / 2,
                z: start.z + (end.z - start.z) / 2
            },
            radius: Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2) + Math.pow(end.z - start.z, 2)) / 2
        };
        this.representation = [
            new Line3d({...start}, {...start, x: end.x}, style),
            new Line3d({...start}, {...start, z: end.z}, style),
            new Line3d({...start, z: end.z}, {...end, y: start.y}, style),
            new Line3d({...start, x: end.x}, {...end, z: start.z}, style),
            new Line3d({...start}, {...start, y: end.y}, style),
            new Line3d({...start, z: end.z}, {...end, x: start.x}, style),
            new Line3d({...end}, {...end, z: start.z}, style),
            new Line3d({...end, y: start.y}, {...end}, style),
            new Line3d({...end, y: start.y}, {...start, x: end.x}, style),
            new Line3d({...end}, {...end, x: start.x}, style),
            new Line3d({...start, y: end.y}, {...end, x: start.x}, style),
            new Line3d({...start, y: end.y}, {...end, z: start.z}, style)
        ];
        this.style = style;
    }

    toLines() {
        return this.representation;
    }

    toMove() {
        return this.representation.reduce((acc, line) => [...acc, ...line.toMove()], [this.box.center]);
    }

    hitBox() {
        return this.box;
    }
}