/**
 * This code is a total mess, but sadly I had little time to finish this.
 */
window.addEventListener('load', main);

const ENEMY_ROWS = 3;
const ENEMY_COLS = 10;

const PLAYER_ACCELERATION = window.innerWidth/2000;
const PLAYER_MAX_SPEED = window.innerWidth/200;
const PLAYER_DRAG = window.innerWidth/20000;
const playerStats = {
    vx: 0,
    x: 0
};

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

    const player = new SceneNode(new GoodGuy(gl, program, 30, [0.0, 0.5, 1, 1]));
    player.setParent(scene.root);

    playerStats.x = gl.canvas.width/2 - 30;

    const controls = new KeyboardControl(window);
    controls.onKey('a', (timefactor) => playerStats.vx = Math.max(playerStats.vx - timefactor*PLAYER_ACCELERATION, -PLAYER_MAX_SPEED));
    controls.onKey('d', (timefactor) => playerStats.vx = Math.min(playerStats.vx + timefactor*PLAYER_ACCELERATION, PLAYER_MAX_SPEED));

    let lastTime = 0;
    drawLoop(lastTime);
    function drawLoop(time) {
        const timefactor = (time - lastTime)/10;
        controls.tick(timefactor);
        playerStats.vx > 0 ? playerStats.vx -= Math.min(PLAYER_DRAG*timefactor, playerStats.vx) : playerStats.vx -= Math.max(-PLAYER_DRAG*timefactor, playerStats.vx);
        playerStats.x += playerStats.vx;
        player.localMatrix = M4.translation(playerStats.x, gl.canvas.height - 60, -0.2);
        scene.draw();
        lastTime = time;
        requestAnimationFrame(drawLoop);
    }
}
