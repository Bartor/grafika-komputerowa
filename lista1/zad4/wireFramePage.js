window.addEventListener('load', () => {
    let perspective = 300;

    let canvas = document.getElementById('wireFrameCanvas');
    const wireFrame = new WireFrame(canvas, perspective);
    let line = new Line3d({x: 100, y: 200, z: 500}, {x: 100, y: 100, z: 100});
    wireFrame.render(line.project(perspective));

    let rerender = timestamp => {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        let line = new Line3d({x: 100, y: 200, z: 500}, {x: Math.sin(timestamp/100)*100, y: 100, z: 100});
        wireFrame.render(line.project(perspective));
        window.requestAnimationFrame(rerender);
    };

    window.requestAnimationFrame(rerender);
});