window.addEventListener('load', () => {
    let perspective = 300;

    const canvas = document.getElementById('wireFrameCanvas');
    const wireFrame = new WireFrame(canvas, perspective);

    wireFrame.addShapes(
        new Cuboid({x: -100, y: -100, z: 100}, {x: 100, y: 100, z: 200}),
        new Cuboid({x: 100, y: 100, z: 100}, {x: 200, y: 200, z: 400})
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
            wireFrame.move(event.movementX, event.movementY);
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
        }
        wireFrame.draw();
    });
});
