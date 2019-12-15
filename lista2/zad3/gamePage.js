/**
 * This code is a total mess, but sadly I had little time to finish this.
 */
window.addEventListener('load', main);

async function main() {
    const gl = document.querySelector('canvas').getContext('webgl');

    const vertexShader = await WebGLUtils.createShader(gl, gl.VERTEX_SHADER, 'shaders/vertex.glsl');
    const fragmentShader = await WebGLUtils.createShader(gl, gl.FRAGMENT_SHADER, 'shaders/fragment.glsl');
    const program = WebGLUtils.createProgram(gl, vertexShader, fragmentShader);
    WebGLUtils.resizeCanvas(gl, gl.canvas);

    const space = new SpaceInvaders(gl, program);
    space.makeEnemies();
    space.makePlayer();

    let lastTime = 0;
    drawLoop(lastTime);
    function drawLoop(time) {
        const timefactor = (time - lastTime)/10;
        space.tick(timefactor, lastTime);
        lastTime = time;
        requestAnimationFrame(drawLoop);
    }
}
