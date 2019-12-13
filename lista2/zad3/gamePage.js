window.addEventListener('load', main);

let playerPosition = 0;
const ENEMIES_SPEED_INVERSE_FACTOR = 30000;

async function main() {
    const gl = document.querySelector('canvas').getContext('webgl');

    const vertexShader = await WebGLUtils.createShader(gl, gl.VERTEX_SHADER, 'shaders/vertex.glsl');
    const fragmentShader = await WebGLUtils.createShader(gl, gl.FRAGMENT_SHADER, 'shaders/fragment.glsl');
    const program = WebGLUtils.createProgram(gl, vertexShader, fragmentShader);
    WebGLUtils.resizeCanvas(gl, gl.canvas);

    const bg = new SceneNode(new Square(gl, program, gl.canvas.width, gl.canvas.height, [0, 0.05, 0.11, 1]));
    for (let i = 0; i < 200; i++) {
        let star = new SceneNode(new Star(gl, program, 2 + Math.random()*5, [0, 0, 0, Math.random()* 0.8 + 0.2]));
        star.localMatrix = M4.multiply(M4.zRotation(Math.random()), M4.translation(2*Math.random(), -2*Math.random(), -0.1));
        star.setParent(bg);
    }

    // translation values are hard coded :c

    const scene = new SceneEngine(bg);
    scene.root.localMatrix = M4.translation(1, -1);

    const enemies = new SceneNode();
    enemies.localMatrix = M4.translation(-0.34, 0.9, -0.2);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 10 + (i % 2); j++) {
            let enemy = new SceneNode(new BadGuy(gl, program, 20, [1, 0.2, 0.2, 1]));
            enemy.localMatrix = M4.translation(j * 0.08 - (i % 2) * 0.04, -i*0.1);

            enemy.setParent(enemies);
        }
    }
    enemies.setParent(scene.root);

    const player = new SceneNode(new Player(gl, program, 30, [0.5, 0.3, 0.9, 1]));
    player.localMatrix = M4.translation(0, 0, -0.2);
    player.setParent(scene.root);

    let lastTime = 0;
    drawLoop(lastTime);
    function drawLoop(time) {
        enemies.localMatrix = M4.translate(enemies.localMatrix, 0, -(time - lastTime)/ENEMIES_SPEED_INVERSE_FACTOR);

        scene.draw();
        lastTime = time;
        requestAnimationFrame(drawLoop);
    }
}