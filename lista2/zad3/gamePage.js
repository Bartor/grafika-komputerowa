window.addEventListener('load', main);

let playerPosition = 0;
const ENEMIES_SPEED_INVERSE_FACTOR = 30000;
const ENEMY_ROWS = 3;
const ENEMY_COLS = 10;

async function main() {
    const gl = document.querySelector('canvas').getContext('webgl');

    const vertexShader = await WebGLUtils.createShader(gl, gl.VERTEX_SHADER, 'shaders/vertex.glsl');
    const fragmentShader = await WebGLUtils.createShader(gl, gl.FRAGMENT_SHADER, 'shaders/fragment.glsl');
    const program = WebGLUtils.createProgram(gl, vertexShader, fragmentShader);
    WebGLUtils.resizeCanvas(gl, gl.canvas);

    const bg = new SceneNode(new Square(gl, program, gl.canvas.width, gl.canvas.height, [0, 0.05, 0.11, 1]));
    for (let i = 0; i < 200; i++) {
        let star = new SceneNode(new Star(gl, program, 2 + Math.random()*5, [0, 0, 0, Math.random()* 0.8 + 0.2]));
        star.localMatrix = M4.multiply(M4.zRotation(Math.random()), M4.translation(gl.canvas.width*Math.random(), gl.canvas.height*Math.random(), -0.1));
        star.setParent(bg);
    }

    const scene = new SceneEngine(bg, gl.canvas.width, gl.canvas.height);
    const enemies = new SceneNode();
    enemies.localMatrix = M4.translation(gl.canvas.width/4);
    for (let i = 0; i < ENEMY_ROWS; i++) {
        for (let j = 0; j < ENEMY_COLS + (i % 2); j++) {
            let enemy = new SceneNode(new BadGuy(gl, program, 20, [1, 0.2, 0.2, 1]));
            enemy.localMatrix = M4.translation((j - (i%2)/2) * gl.canvas.width/(2*(ENEMY_COLS)), i * gl.canvas.height/15);

            enemy.setParent(enemies);
        }
    }
    enemies.setParent(scene.root);

    const player = new SceneNode(new Player(gl, program, 30, [0.5, 0.3, 0.9, 1]));
    player.localMatrix = M4.translation(gl.canvas.width/2 - 30, gl.canvas.height - 30, -0.2);
    player.setParent(scene.root);

    let lastTime = 0;
    drawLoop(lastTime);
    function drawLoop(time) {
        scene.draw();
        lastTime = time;
        // requestAnimationFrame(drawLoop);
    }
}
