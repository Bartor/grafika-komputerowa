class WireFrame {
    constructor(canvasElement, perspective) {
        this.context = canvasElement.getContext('2d');
        this.dHeight = canvasElement.height/2;
        this.dWidth = canvasElement.width/2;

        this.perspective = perspective;
    }

    render(renderList) {
        this.context.beginPath();
        if (renderList.length > 0) {
            this.context.moveTo(renderList[0].x, renderList[0].y);
            renderList.splice(0, 1);
        }
        renderList.forEach(renderPoint => {
                this.context.lineTo(renderPoint.x + this.dWidth, renderPoint.y + this.dHeight);
        });
        this.context.stroke();
    }
}

class Line3d {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    project(perspective) {
        return [
            {
                x: perspective * this.start.x / (perspective + this.start.z),
                y: perspective * this.start.y / (perspective + this.start.z)
            },
            {
                x: perspective * this.end.x / (perspective + this.end.z),
                y: perspective * this.end.y / (perspective + this.end.z)
            }
        ];
    }
}