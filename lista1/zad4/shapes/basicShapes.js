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
        this.start = start;
        this.end = end;
    }

    toMove() {
        return [
            this.start,
            this.end
        ];
    }

    toLines() {
        return [
            new Line3d(this.start, {...this.start, x: this.end.x}),
            new Line3d(this.start, {...this.start, z: this.end.z}),
            new Line3d({...this.start, z: this.end.z}, {...this.end, y: this.start.y}),
            new Line3d({...this.start, x: this.end.x}, {...this.end, z: this.start.z}),
            new Line3d(this.start, {...this.start, y: this.end.y}),
            new Line3d({...this.start, z: this.end.z}, {...this.end, x: this.start.x}),
            new Line3d(this.end, {...this.end, z: this.start.z}),
            new Line3d({...this.end, y: this.start.y}, this.end),
            new Line3d({...this.end, y: this.start.y}, {...this.start, x: this.end.x}),
            new Line3d(this.end, {...this.end, x: this.start.x}),
            new Line3d({...this.start, y: this.end.y}, {...this.end, x: this.start.x}),
            new Line3d({...this.start, y: this.end.y}, {...this.end, z: this.start.z}),
        ];
    }
}