export class WireFrame {
    constructor(canvasElement, perspective) {
        this.context = canvasElement.getContext('2d');
        this.dHeight = canvasElement.height / 2;
        this.dWidth = canvasElement.width / 2;

        this.shapes = [];
        this.points = [];
        this.perspective = perspective;
    }

    addShapes(...shapes) {
        this.shapes = [...this.shapes, ...shapes];
        this.points = [...this.points, ...shapes.reduce((acc, shape) => [...acc, ...shape.toMove()], [])];
    }

    render(renderList) {
        this.context.beginPath();
        renderList.forEach(renderPoint => {
            this.context.moveTo(renderPoint.start.x + this.dWidth, renderPoint.start.y + this.dHeight);
            this.context.lineTo(renderPoint.end.x + this.dWidth, renderPoint.end.y + this.dHeight);
        });
        this.context.stroke();
    }

    draw() {
        this.context.clearRect(0, 0, this.dWidth * 2 + 1, this.dHeight * 2 + 1);
        this.shapes.forEach(shape => {
            this.render(shape.toLines().reduce((acc, line) => [...acc, ...line.project(this.perspective)], []));
        });
    }

    move(dx = 0, dy = 0, dz = 0) {
        this.points.forEach(point => {
            point.x += dx;
            point.y += dy;
            point.z += dz;
        });
    }

    rotate(pitch = 0, roll = 0, yaw = 0) {
        let cosa = Math.cos(yaw);
        let sina = Math.sin(yaw);

        let cosb = Math.cos(pitch);
        let sinb = Math.sin(pitch);

        let cosc = Math.cos(roll);
        let sinc = Math.sin(roll);

        let Axx = cosa*cosb;
        let Axy = cosa*sinb*sinc - sina*cosc;
        let Axz = cosa*sinb*cosc + sina*sinc;

        let Ayx = sina*cosb;
        let Ayy = sina*sinb*sinc + cosa*cosc;
        let Ayz = sina*sinb*cosc - cosa*sinc;

        let Azx = -sinb;
        let Azy = cosb*sinc;
        let Azz = cosb*cosc;

        this.points.forEach(point => {
            let [px, py, pz] = [point.x, point.y, point.z + this.perspective];

            point.x = Axx*px + Axy*py + Axz*pz;
            point.y = Ayx*px + Ayy*py + Ayz*pz;
            point.z = Azx*px + Azy*py + Azz*pz - this.perspective;
        });
    }
}

export class Line3d {
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