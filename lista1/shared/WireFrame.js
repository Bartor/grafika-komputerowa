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

    removeShape(shapeToRemove) {
        let found = this.shapes.indexOf(shapeToRemove);
        if (found !== -1) {
            this.shapes.splice(found, 1);
            const pointsToRemove = shapeToRemove.toMove();
            for (let i = 0; i < this.points.length; i++) {
                found = pointsToRemove.indexOf(this.points[i]);
                if (found !== -1) {
                    this.points.splice(i, 1);
                    i--;
                }
            }
        }
    }

    render(renderList, style) {
        this.context.beginPath();
        renderList.forEach(renderPoint => {
            this.context.moveTo(renderPoint.start.x + this.dWidth, renderPoint.start.y + this.dHeight);
            this.context.lineTo(renderPoint.end.x + this.dWidth, renderPoint.end.y + this.dHeight);
        });
        this.context.strokeStyle = style;
        this.context.stroke();
    }

    draw() {
        this.context.clearRect(0, 0, this.dWidth * 2 + 1, this.dHeight * 2 + 1);
        this.shapes.forEach(shape => {
            this.render(shape.toLines().reduce((acc, line) => [...acc, ...line.project(this.perspective)], []), shape.style);
        });
    }

    move(dx = 0, dy = 0, dz = 0) {
        this.points.forEach(point => {
            point.x += dx;
            point.y += dy;
            point.z += dz;
        });
    }

    rotationMatrix(pitch = 0, roll = 0, yaw = 0) {
        let cosA = Math.cos(yaw);
        let sinA = Math.sin(yaw);

        let cosB = Math.cos(pitch);
        let sinB = Math.sin(pitch);

        let cosC = Math.cos(roll);
        let sinC = Math.sin(roll);

        let Axx = cosA*cosB;
        let Axy = cosA*sinB*sinC - sinA*cosC;
        let Axz = cosA*sinB*cosC + sinA*sinC;

        let Ayx = sinA*cosB;
        let Ayy = sinA*sinB*sinC + cosA*cosC;
        let Ayz = sinA*sinB*cosC - cosA*sinC;

        let Azx = -sinB;
        let Azy = cosB*sinC;
        let Azz = cosB*cosC;

        return [
          [Axx, Axy, Axz],
          [Ayx, Ayy, Ayz],
          [Azx, Azy, Azz]
        ];
    }

    rotateCamera(pitch = 0, roll = 0, yaw = 0) {
        let matrix = this.rotationMatrix(pitch, roll, yaw);

        this.points.forEach(point => {
            let [px, py, pz] = [point.x, point.y, point.z + this.perspective];

            point.x = matrix[0][0]*px + matrix[0][1]*py + matrix[0][2]*pz;
            point.y = matrix[1][0]*px + matrix[1][1]*py + matrix[1][2]*pz;
            point.z = matrix[2][0]*px + matrix[2][1]*py + matrix[2][2]*pz - this.perspective;
        });
    }

    rotateShape(shape, pivot, pitch = 0, roll = 0, yaw = 0) {
        let matrix= this.rotationMatrix(pitch, roll, yaw);

        shape.toMove().forEach(point => {
            let [px, py, pz] = [point.x - pivot.x, point.y - pivot.y, point.z - pivot.z];

            point.x = matrix[0][0]*px + matrix[0][1]*py + matrix[0][2]*pz + pivot.x;
            point.y = matrix[1][0]*px + matrix[1][1]*py + matrix[1][2]*pz + pivot.y;
            point.z = matrix[2][0]*px + matrix[2][1]*py + matrix[2][2]*pz + pivot.z;
        });
    }
}

export class Line3d {
    constructor(start, end, style = '#000000') {
        this.start = start;
        this.end = end;
        this.style = style;
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