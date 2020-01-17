const DEFAULT_FIDELITY = 50;
const DEFAULT_GRAPH_SIZE = 1000;

function resize(canvas) {
    if (canvas.width !== canvas.clientWidth) {
        canvas.width = canvas.clientWidth;
    }

    if (canvas.height !== canvas.clientHeight) {
        canvas.height = canvas.clientHeight;
    }
}


class GraphEngine {
    /**
     * Creates a graph rendering engine using given canvas and function.
     * @param canvasElement Canvas to draw on.
     * @param functionToGraph Function R^2 -> R to draw.
     */
    constructor(canvasElement, functionToGraph) {
        this.gl = canvasElement.getContext('webgl');
        resize(canvasElement);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.height = this.gl.canvas.height;
        this.width = this.gl.canvas.width;

        this.fn = functionToGraph;

        this.points = [];
        this.glInfo = {
            program: null,
            positionBuffer: null,
            positionLocation: null,
            colorBuffer: null,
            colorLocation: null,
            matrixLocation: null
        };
        this.fidelity = DEFAULT_FIDELITY;
        this.graphSize = DEFAULT_GRAPH_SIZE;
        this.triangles = false;
    }

    /**
     * Creates shaders and program.
     * @returns {Promise<>} Fulfills on completion.
     */
    init() {
        return new Promise((resolve, reject) => {
            Promise.all([
                WebGLUtils.createShader(this.gl, this.gl.VERTEX_SHADER, 'shaders/vertex.glsl'),
                WebGLUtils.createShader(this.gl, this.gl.FRAGMENT_SHADER, 'shaders/fragment.glsl')
            ]).then(shaders => {
                const program = WebGLUtils.createProgram(this.gl, shaders[0], shaders[1]);
                this.glInfo.program = program;
                this.glInfo.positionLocation = this.gl.getAttribLocation(program, 'a_position');
                this.glInfo.colorLocation = this.gl.getAttribLocation(program, 'a_color');
                this.glInfo.matrixLocation = this.gl.getUniformLocation(program, 'u_matrix');

                resolve();
            }).catch(reject);
        });
    }

    /**
     * Decides which portion of the function to draw.
     * @param xBounds First arguments from x0 to x1 in form of [x0, x1]
     * @param yBounds Second arguments from y0 to y1 in form of [y0, y1]
     * @param normalizeHeight Should Z be normalized (to half the graph size)
     * @param triangles If area should be filled with triangles
     */
    drawArea(xBounds, yBounds, triangles = false, normalizeHeight = false) {
        this.triangles = triangles;
        this.points = [];
        let minValue = Number.POSITIVE_INFINITY;
        let maxValue = Number.NEGATIVE_INFINITY;
        for (let x = 0; x < this.fidelity; x++) {
            for (let y = 0; y < this.fidelity; y++) {
                const val = this.fn(
                    xBounds[0] + x * (xBounds[1] - xBounds[0]) / this.fidelity,
                    yBounds[0] + y * (yBounds[1] - yBounds[0]) / this.fidelity
                );

                if (triangles) {
                    let nextY = null, nextX = null, nextYX = null;
                    if (y !== this.fidelity - 1) {
                        nextY = this.fn(
                            xBounds[0] + x * (xBounds[1] - xBounds[0]) / this.fidelity,
                            yBounds[0] + (y + 1) * (yBounds[1] - yBounds[0]) / this.fidelity
                        );
                    }
                    if (x !== this.fidelity - 1) {
                        nextX = this.fn(
                            xBounds[0] + (x + 1) * (xBounds[1] - xBounds[0]) / this.fidelity,
                            yBounds[0] + y * (yBounds[1] - yBounds[0]) / this.fidelity
                        );
                    }
                    if (x !== this.fidelity - 1 && y !== this.fidelity - 1) {
                        nextYX = this.fn(
                            xBounds[0] + (x + 1) * (xBounds[1] - xBounds[0]) / this.fidelity,
                            yBounds[0] + (y + 1) * (yBounds[1] - yBounds[0]) / this.fidelity
                        );
                    }

                    if (nextX !== null && nextY !== null && nextYX !== null) {
                        this.points.push(
                            x * this.graphSize / this.fidelity - this.graphSize / 2,
                            y * this.graphSize / this.fidelity - this.graphSize / 2,
                            val,
                            (x + 1) * this.graphSize / this.fidelity - this.graphSize / 2,
                            y * this.graphSize / this.fidelity - this.graphSize / 2,
                            nextX,
                            x * this.graphSize / this.fidelity - this.graphSize / 2,
                            (y + 1) * this.graphSize / this.fidelity - this.graphSize / 2,
                            nextY,
                            (x + 1) * this.graphSize / this.fidelity - this.graphSize / 2,
                            (y + 1) * this.graphSize / this.fidelity - this.graphSize / 2,
                            nextYX,
                            (x + 1) * this.graphSize / this.fidelity - this.graphSize / 2,
                            y * this.graphSize / this.fidelity - this.graphSize / 2,
                            nextX,
                            x * this.graphSize / this.fidelity - this.graphSize / 2,
                            (y + 1) * this.graphSize / this.fidelity - this.graphSize / 2,
                            nextY
                        );
                    }
                } else {
                    this.points.push(
                        x * this.graphSize / this.fidelity - this.graphSize / 2,
                        y * this.graphSize / this.fidelity - this.graphSize / 2,
                        val
                    );
                }

                if (val > maxValue) maxValue = val;
                if (val < minValue) minValue = val;
            }
        }

        let scaleFactor = normalizeHeight ? 1 / 2 * this.graphSize / (maxValue - minValue) : Math.abs(xBounds[0] - xBounds[1]) * Math.abs(yBounds[1] - yBounds[0]);

        this.points = this.points.map((p, i) => i % 3 === 2 ? p * scaleFactor : p);

        this.glInfo.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.glInfo.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.points), this.gl.STATIC_DRAW);
    }

    draw(transformMatrix) {
        this.gl.useProgram(this.glInfo.program);
        this.gl.enable(this.gl.DEPTH_TEST);

        this.gl.uniformMatrix4fv(this.glInfo.matrixLocation, false, transformMatrix);

        this.gl.enableVertexAttribArray(this.glInfo.positionLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.glInfo.positionBuffer);
        this.gl.vertexAttribPointer(
            this.glInfo.positionLocation,
            3,
            this.gl.FLOAT,
            false,
            0,
            0
        );

        this.gl.drawArrays(
            this.triangles ? this.gl.TRIANGLES : this.gl.POINTS,
            0,
            this.triangles ? 6 * this.fidelity ** 2 : this.fidelity ** 2
        );
    }
}