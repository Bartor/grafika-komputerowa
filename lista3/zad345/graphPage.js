window.addEventListener('load', () => {
    const container = document.querySelector('main');
    const input = document.querySelector('input');

    input.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            const fn = eval(input.value); // whatever
            createGraph(container, fn);
        }
    });

    createGraph(container, (x, y) => Math.sin(x * y));
});

function createGraph(container, fn, xBounds = [-5, 5], yBounds = [-5, 5]) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const canvas = document.createElement('canvas');
    canvas.height = 800;
    canvas.width = 1200;
    container.append(canvas);

    const engine = new GraphEngine(canvas, fn);
    engine.init().then(() => {
        const movement = {
            y: Math.PI / 3,
            x: 0,
            dist: 2000,
            changed: true
        };
        const controls = new MouseControl(canvas);
        controls.addListener((x, y) => {
            movement.y -= y;
            movement.x += x;
            movement.changed = true;
        }, 100, 100);

        document.addEventListener('wheel', e => {
            movement.dist += e.deltaY;
            movement.changed = true
        });

        engine.drawArea(xBounds, yBounds, true);

        let projectionMatrix = M4.perspective(Math.PI / 4, canvas.width / canvas.height, 1, 5000);

        const drawLoop = () => {
            if (movement.changed) {
                let cameraMatrix = M4.xRotation(movement.y);
                cameraMatrix = M4.yRotate(cameraMatrix, movement.x);
                cameraMatrix = M4.translate(cameraMatrix, 0, 0, movement.dist);

                engine.draw(M4.inverse(cameraMatrix), projectionMatrix);
                movement.changed = false;
            }
            requestAnimationFrame(drawLoop);
        };

        drawLoop();
    }).catch(console.error);
}
