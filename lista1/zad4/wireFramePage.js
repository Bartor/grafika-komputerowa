window.addEventListener('load', () => {
    let perspective = 500;

    const canvas = document.getElementById('wireFrameCanvas');
    const wireFrame = new WireFrame(canvas, perspective);

    wireFrame.addShapes(
        new Cuboid({x: 0, y: 200, z: 100}, {x: 100, y: 100, z: 200}),
        new Cuboid({x: -100, y: 200, z: 100}, {x: 0, y: 100, z: 200}),
        new Cuboid({x: -100, y: 200, z: 200}, {x: 0, y: 100, z: 300}),
        new Cuboid({x: 100, y: 200, z: 300}, {x: 0, y: 100, z: 200}),
        new Line3d({x: 0, y: 0, z: 100}, {x: 0, y: 100, z: 200}),
        new Line3d({x: 0, y: 0, z: 300}, {x: 0, y: 100, z: 200}),
        new Line3d({x: 100, y: 0, z: 200}, {x: 0, y: 100, z: 200}),
        new Line3d({x: -100, y: 0, z: 200}, {x: 0, y: 100, z: 200}),
    );

    // let rerender = () => {
    //     wireFrame.draw();
    //     window.requestAnimationFrame(rerender);
    // };
    // window.requestAnimationFrame(rerender);

    wireFrame.draw();
    let drag = false;
    canvas.addEventListener('mousedown', () => drag = true);
    canvas.addEventListener('mouseup', () => drag = false);
    canvas.addEventListener('mouseout', () => drag = false);
    canvas.addEventListener('mousemove', event => {
        if (drag) {
            wireFrame.rotate(0, event.movementY/500);
            wireFrame.rotate(-event.movementX/500);
            wireFrame.draw();
        }
    });

    window.addEventListener('keydown', event => {
        const delta = 10;
        switch (event.key) {
            case 'w':
                wireFrame.move(0, 0, -delta);
                break;
            case 's':
                wireFrame.move(0, 0, delta);
                break;
            case 'a':
                wireFrame.move(delta);
                break;
            case 'd':
                wireFrame.move(-delta);
                break;
        }
        wireFrame.draw();
    });
});
