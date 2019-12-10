window.addEventListener('load', main);

class DrawThing {
    constructor(gl, vertexShader, fragmentShader) {
        this.gl = gl;

        this.program = WebGLUtils.createProgram(this.gl, vertexShader, fragmentShader);
        this.colorBuffer = null;
        this.positionBuffer = null;

        this.drawCount = 0;

        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.colorLocation = this.gl.getAttribLocation(this.program, 'a_color');
        this.resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');
    }

    bufferColors(colors) { // [r1, g2, b1, a1, r2, g2, b2, a2, ...]
        this.colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
    }

    bufferPositions(positions) { // [x1, y1, x2, y2, x3, y3, ...]
        this.drawCount = positions.length / 2;
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    }

    draw(primitiveType) {
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.useProgram(this.program);
        this.gl.uniform2f(this.resolutionLocation, this.gl.canvas.width, this.gl.canvas.height);

        // positions
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        let size = 2;
        let type = this.gl.FLOAT;
        let normalize = false;
        let stride = 0;
        let offset = 0;
        this.gl.vertexAttribPointer(this.positionLocation, size, type, normalize, stride, offset);

        // colors
        this.gl.enableVertexAttribArray(this.colorLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        size = 4;
        type = this.gl.FLOAT;
        normalize = false;
        stride = 0;
        offset = 0;
        this.gl.vertexAttribPointer(this.colorLocation, size, type, normalize, stride, offset);

        this.gl.drawArrays(primitiveType, 0, this.drawCount);
    }
}

async function main() {
    const current = document.getElementById('current');
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl');

    let type = gl.POINTS;
    let changed = false;
    document.querySelector('nav').addEventListener('click', event => {
        if (event.target.id) {
            const name = event.target.id.toUpperCase();
            type = gl[name];
            current.textContent = `CURRENT: ${name}`;
            changed = true;
        }
    });

    const drawables = [];
    const MAX_LENGTH = 24;
    const position = {
        drag: false,
        moved: false,
        x: 0,
        y: 0
    };

    const vertexShader = await WebGLUtils.createShader(gl, gl.VERTEX_SHADER, 'shaders/vertex.glsl');
    const fragmentShader = await WebGLUtils.createShader(gl, gl.FRAGMENT_SHADER, 'shaders/fragment.glsl');
    WebGLUtils.resizeCanvas(gl, gl.canvas);

    const drawThing = new DrawThing(gl, vertexShader, fragmentShader);

    function updatePos(event) {
        changed = true;
        event.preventDefault();
        if (position.drag) {
            if (drawables.length >= MAX_LENGTH) {
                drawables.shift();
            }
            drawables.push({
                position: [event.offsetX, event.offsetY],
                color: [Math.random(), Math.random(), Math.random(), 1]
            });
        }
    }
    canvas.addEventListener('mousemove', updatePos);
    canvas.addEventListener('mousedown', e => {
        position.drag = true;
        updatePos(e);
    });
    canvas.addEventListener('mouseup', () => position.drag = false);
    canvas.addEventListener('mouseout', () => position.drag = false);

    function drawLoop() {
        if (changed) {
            changed = false;
            drawThing.bufferPositions(drawables.reduce((a, e) => [...a, ...e.position], []));
            drawThing.bufferColors(drawables.reduce((a, e) => [...a, ...e.color], []));
            drawThing.draw(type);
        }
        requestAnimationFrame(drawLoop);
    }
    drawLoop();
}