import {Line3d} from "../../shared/WireFrame.js";

export class Cuboid {
    constructor(start, end, style = '#000000') {
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
        return this.representation.reduce((acc, line) => [...acc, ...line.toMove()], []);
    }
}