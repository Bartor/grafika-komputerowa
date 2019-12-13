window.addEventListener('load', main);

async function main() {
    const gl = document.querySelector('canvas').getContext('webgl');

    const vertexShader = await WebGLUtils.createShader(gl, gl.VERTEX_SHADER, 'shaders/vertex.glsl');
    const fragmentShader = await WebGLUtils.createShader(gl, gl.FRAGMENT_SHADER, 'shaders/fragment.glsl');
    const program = WebGLUtils.createProgram(gl, vertexShader, fragmentShader);
    WebGLUtils.resizeCanvas(gl, gl.canvas);

    const scene = new SceneEngine();
    scene.root.appendChild(
        new SceneNode(
            new Square(
                gl,
                program,
                50,
                50
            )
        )
    );
    scene.draw();
}