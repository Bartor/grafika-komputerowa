window.addEventListener('load', () => {
    let perspective = 300;

    const canvas = document.getElementById('wireFrameCanvas');
    const wireFrame = new WireFrame(canvas, perspective);

    let shapes = [
        new Cuboid({x: -100, y: -100, z: 100}, {x: 100, y: 100, z: 200}),
        new Cuboid({x: 100, y: 100, z: 100}, {x: 200, y: 200, z: 400}),
    ];

    let rerender = timestamp => {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        shapes.forEach(shape => wireFrame.render(shape.toLines().reduce((acc, line) => [...acc, ...line.project(200)], [])));
        window.requestAnimationFrame(rerender);
    };

    window.requestAnimationFrame(rerender);

    const points = shapes.reduce((acc, shape) => [...acc, ...shape.toMove()], []);
    let drag = false;
    canvas.addEventListener('mousedown', () => drag = true);
    canvas.addEventListener('mouseup', () => drag = false);
    canvas.addEventListener('mouseout', () => drag = false);
    canvas.addEventListener('mousemove', event => {
        if (drag) {
            points.forEach(point => {
                point.x += event.movementX;
                point.y += event.movementY;
            });
        }
    });

    window.addEventListener('keydown', event => {
        const delta = 10;
        switch (event.key) {
            case 'ArrowLeft':
                points.forEach(point => point.x -= delta);
                break;
            case 'ArrowRight':
                points.forEach(point => point.x += delta);
                break;
            case 'ArrowDown':
                points.forEach(point => point.z += delta);
                break;
            case 'ArrowUp':
                points.forEach(point => point.z -= delta);
                break;
        }
    });
});
