class Line3d {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    project(perspective) {
        if (this.start.z <= -perspective && this.end.z <= -perspective) {
            return [];
        }
        return [{
            start: {
                // This 0.01 should be actually 0, but canvas doesn't allow to draw at infinity
                // todo: parametrize this 0.01 according to canvas size
                x: perspective * this.start.x / Math.max(perspective + this.start.z, 0.01),
                y: perspective * this.start.y / Math.max(perspective + this.start.z, 0.01)
            },
            end: {
                x: perspective * this.end.x / Math.max(perspective + this.end.z, 0.01),
                y: perspective * this.end.y / Math.max(perspective + this.end.z, 0.01)
            }
        }];
    }

    toLines() {
        return [this];
    }

    toMove() {
        return [
            this.start,
            this.end
        ];
    }
}

class Cuboid {
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