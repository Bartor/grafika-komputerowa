window.addEventListener('load', main);

async function main() {
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl');

    const vertexShader = await WebGLUtils.createShader(gl, gl.VERTEX_SHADER, 'shaders/vertex.glsl');
    const fragmentShader = await WebGLUtils.createShader(gl, gl.FRAGMENT_SHADER, 'shaders/fragment.glsl');

    const program = WebGLUtils.createProgram(gl, vertexShader, fragmentShader);
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        0, 0,
        0, 0.5,
        0.7, 0,
        0.2, 1,
        0.3, 0.3,
        0.1, 0.2
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    WebGLUtils.resizeCanvas(gl, canvas);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const size = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    const primitiveType = gl.TRIANGLES;
    gl.drawArrays(primitiveType, 0, 6);
}

