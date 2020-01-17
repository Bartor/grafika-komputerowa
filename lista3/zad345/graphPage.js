window.addEventListener('load', () => {
    const canvas = document.querySelector('canvas');

    const engine = new GraphEngine(canvas, (x, y) => Math.sqrt(x ** 2 + y ** 2));
    engine.init().then(() => {
        const rot = {
            y: Math.PI / 3,
            x: 0,
            changed: true
        };
        const controls = new MouseControl(canvas);
        controls.addListener((x, y) => {
            rot.y -= y;
            rot.x += x;
            rot.changed = true;
        }, 100, 100);

        engine.drawArea([-5, 5], [-5, 5]);

        let tm = M4.perspective(Math.PI / 4, canvas.width / canvas.height, 1, 5000);

        const drawLoop = () => {
            if (rot.changed) {
                let cameraMatrix = M4.xRotation(rot.y);
                cameraMatrix = M4.translate(cameraMatrix, 0, 0, 2000);
                let projectionMatrix = M4.multiply(tm, M4.inverse(cameraMatrix));

                engine.draw(projectionMatrix);
                rot.changed = false;
            }
            requestAnimationFrame(drawLoop);
        };

        drawLoop();
    }).catch(console.error);
});