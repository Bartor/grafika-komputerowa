class WireFrame {
    constructor(canvasElement, perspective) {
        this.context = canvasElement.getContext('2d');
        this.dHeight = canvasElement.height / 2;
        this.dWidth = canvasElement.width / 2;

        this.perspective = perspective;
    }

    render(renderList) {
        this.context.beginPath();
        renderList.forEach(renderPoint => {
            this.context.moveTo(renderPoint.start.x + this.dWidth, renderPoint.start.y + this.dHeight);
            this.context.lineTo(renderPoint.end.x + this.dWidth, renderPoint.end.y + this.dHeight);
        });
        this.context.stroke();
    }
}