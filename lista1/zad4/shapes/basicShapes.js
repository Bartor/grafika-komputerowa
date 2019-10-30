class Line3d {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    project(perspective) {
        return [{
            start: {
                x: perspective * this.start.x / (perspective + this.start.z),
                y:
                    perspective * this.start.y / (perspective + this.start.z)
            }
            ,
            end: {
                x: perspective * this.end.x / (perspective + this.end.z),
                y:
                    perspective * this.end.y / (perspective + this.end.z)
            }
        }];
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