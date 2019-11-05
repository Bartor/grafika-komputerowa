import {Line3d} from "../../shared/WireFrame.js";

export class Cuboid {
    constructor(start, end) {
        this.representation = [
            new Line3d({...start}, {...start, x: end.x}),
            new Line3d({...start}, {...start, z: end.z}),
            new Line3d({...start, z: end.z}, {...end, y: start.y}),
            new Line3d({...start, x: end.x}, {...end, z: start.z}),
            new Line3d({...start}, {...start, y: end.y}),
            new Line3d({...start, z: end.z}, {...end, x: start.x}),
            new Line3d({...end}, {...end, z: start.z}),
            new Line3d({...end, y: start.y}, {...end}),
            new Line3d({...end, y: start.y}, {...start, x: end.x}),
            new Line3d({...end}, {...end, x: start.x}),
            new Line3d({...start, y: end.y}, {...end, x: start.x}),
            new Line3d({...start, y: end.y}, {...end, z: start.z})
        ];
    }

    toLines() {
        return this.representation;
    }

    toMove() {
        return this.representation.reduce((acc, line) => [...acc, ...line.toMove()], []);
    }
}