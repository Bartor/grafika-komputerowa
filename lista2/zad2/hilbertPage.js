window.addEventListener('load', main);

class HilbertDrawer {
    constructor(gl, vertexShader, fragmentShader) {
        this.gl = gl;

        this.program = WebGLUtils.createProgram(this.gl, vertexShader, fragmentShader);
        this.colorBuffer = null;
        this.positionBuffer = null;
        this.drawCounts = [];

        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.colorLocation = this.gl.getAttribLocation(this.program, 'a_color');
    }

    /**
     * Level {
     *     color: [r, g, b, a]
     *     positions: [x1, y1, z1, x2, y2, z2, ...] normalized
     * }
     * @param levels Level[]
     */
    bufferLevels(levels) {
        this.drawCounts = levels.map(l => l.positions.length / 3).reduce((a, e) => a + e, 0);

        this.colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(
            levels.reduce(
                (a, e) => [...a, ...new Array(e.positions.length / 3 * 4).fill(1).map((_, i) => e.color[i % e.color.length])],
                [])
        ), this.gl.STATIC_DRAW);

        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(
            levels.reduce((a, e) => [...a, ...e.positions], [])
        ), this.gl.STATIC_DRAW);
    }

    draw() {
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);

        this.gl.useProgram(this.program);

        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(
            this.positionLocation,
            3, // x y z
            this.gl.FLOAT,
            false,
            0,
            0
        );

        this.gl.enableVertexAttribArray(this.colorLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.vertexAttribPointer(
            this.colorLocation,
            4,
            this.gl.FLOAT,
            false,
            0,
            0
        );

        this.gl.drawArrays(this.gl.LINES, 0, this.drawCounts);
    }
}

function generateHilbert(level, color, depth) {
    const res = {
        level: level,
        depth: depth,
        color: color,
        positions: []
    };
    let size = 2 ** level;
    let prev = {x: 0, y: 0};
    for (let i = 1; i < size * size; i++) {
        let result = hilbertXY(i, size);
        res.positions.push(prev.x / (size - 1), prev.y / (size - 1), depth, result.x / (size - 1), result.y / (size - 1), depth);
        prev = result;
    }
    return res;
}

function updateHilbert(hilbert, newDepth, newColor) {
    if (newDepth !== undefined) {
        hilbert.depth = newDepth;
        for (let i = 2; i < hilbert.positions.length; i += 3) {
            hilbert.positions[i] = newDepth;
        }
    }
    if (newColor !== undefined) {
        hilbert.color = newColor;
    }
}

function updateControls(hilberts, d) {
    const container = document.getElementById('controls');
    while (container.firstChild) container.removeChild(container.firstChild);
    hilberts.sort((a, b) => a.depth - b.depth).forEach(hilbert => {
        const controls = document.createElement('div');
        const text = document.createElement('p');

        controls.className = 'control';

        const upButton = document.createElement('button');
        upButton.textContent = '▲';
        const downButton = document.createElement('button');
        downButton.textContent = '▼';
        const rgbInput = document.createElement('input');
        rgbInput.value = hilbert.color.join(',');
        const upDownDiv = document.createElement('div');
        upDownDiv.className = 'up-down';

        downButton.addEventListener('click', () => {
            updateHilbert(hilbert, hilbert.depth + 0.05);
            updateControls(hilberts, d);
            console.log(hilberts);
            d.bufferLevels(hilberts);
            d.draw();
        });

        upButton.addEventListener('click', () => {
            updateHilbert(hilbert, hilbert.depth - 0.05);
            console.log(hilberts);
            updateControls(hilberts, d);
            d.bufferLevels(hilberts);
            d.draw();
        });

        rgbInput.addEventListener('input', () => {
            let rgb = rgbInput.value.split(',').map(n => Number(n));
            if (rgb.length === 4 && rgb.every(num => !isNaN(num) && isFinite(num) && num >= 0 && num <= 1)) {
                updateHilbert(hilbert, undefined, rgb);
                d.bufferLevels(hilberts);
                d.draw();
            }
        });

        upDownDiv.append(upButton, downButton);
        controls.append(upDownDiv, rgbInput);
        container.append(text, controls);
    });
}

async function main() {
    const hilberts = [];

    const button = document.getElementById('add');
    const level = document.getElementById('level');
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl');

    const vertexShader = await WebGLUtils.createShader(gl, gl.VERTEX_SHADER, 'shaders/vertex.glsl');
    const fragmentShader = await WebGLUtils.createShader(gl, gl.FRAGMENT_SHADER, 'shaders/fragment.glsl');
    WebGLUtils.resizeCanvas(gl, gl.canvas);

    const d = new HilbertDrawer(gl, vertexShader, fragmentShader);
    button.addEventListener('click', () => {
        hilberts.push(generateHilbert(Number(level.value), [0, 0, 0, 1], 0.5));
        updateControls(hilberts, d);
        d.bufferLevels(hilberts);
        d.draw();
    });

}