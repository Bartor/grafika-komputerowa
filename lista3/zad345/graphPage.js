window.addEventListener('load', () => {
    const canvas = document.querySelector('canvas');

    const engine = new GraphEngine(canvas, (x, y) => Math.sin(x) * Math.cos(y));
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

        engine.drawArea([-5, 5], [-5, 5], true);

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
});
