class WireFrame {
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
        this.context.clearRect(0, 0, this.dHeight * 2 + 1, this.dHeight * 2 + 1);
        this.shapes.forEach(shape => {
            this.render(shape.toLines().reduce((acc, line) => [...acc, ...line.project(this.perspective)], []));
        });
    }

    move(dx = 0, dy = 0, dz = 0) {
        this.points.forEach(point => {
            point.x += dx;
            point.y += dy;
            point.z += dz;
        })
    }
}