const DEFAULT_FIDELITY = 500;
const DEFAULT_GRAPH_SIZE = 1000;

function resize(canvas, gl) {
    if (canvas.width !== canvas.clientWidth) {
        canvas.width = canvas.clientWidth;
        gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    }

    if (canvas.height !== canvas.clientHeight) {
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    }
}

/**
 * Calculates a normal vector of a triangle
 * @param triangle [x0, y0, z0, x1, y1, z1, x2, y2, z2]
 *        index:     0,  1,  2,  3,  4,  5,  6,  7,  8
 * @param swap Should we swap the vars?
 */
function triangleNormal(triangle, swap = false) {
    let U = [triangle[3] - triangle[0], triangle[4] - triangle[1], triangle[5] - triangle[2]];
    let V = [triangle[6] - triangle[0], triangle[7] - triangle[1], triangle[8] - triangle[2]];

    if (swap) [U, V] = [V, U];

    return [
        U[1] * V[2] - U[2] * V[1],
        U[2] * V[0] - U[0] * V[2],
        U[0] * V[1] - U[1] * V[0]
    ];
}


class GraphEngine {
    /**
     * Creates a graph rendering engine using given canvas and function.
     * @param canvasElement Canvas to draw on.
     * @param functionToGraph Function R^2 -> R to draw.
     */
    constructor(canvasElement, functionToGraph) {
        this.gl = canvasElement.getContext('webgl');
        resize(canvasElement, this.gl);

        this.height = this.gl.canvas.height;
        this.width = this.gl.canvas.width;

        this.fn = functionToGraph;

        this.points = [];
        this.normals = [];
        this.glInfo = {
            program: null,
            positionBuffer: null,
            positionLocation: null,
            normalBuffer: null,
            normalLocation: null,
            worldViewLocation: null,
            projectionLocation: null,
            fogNearLocation: null,
            forFarLocation: null,
            reverseLightDirection: null,
            ambientLocation: null
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
                this.glInfo.normalLocation = this.gl.getAttribLocation(program, 'a_normal');
                this.glInfo.worldViewLocation = this.gl.getUniformLocation(program, 'u_worldView');
                this.glInfo.projectionLocation = this.gl.getUniformLocation(program, 'u_projection');
                this.glInfo.fogNearLocation = this.gl.getUniformLocation(program, 'u_fogNear');
                this.glInfo.forFarLocation = this.gl.getUniformLocation(program, 'u_fogFar');
                this.glInfo.reverseLightDirection = this.gl.getUniformLocation(program, 'u_reverseLightDirection');
                this.glInfo.ambientLocation = this.gl.getUniformLocation(program, 'u_ambient');
                resolve();
            }).catch(reject);
        });
    }

    /**
     * Decides which portion of the function to draw.
     * @param xBounds First arguments from x0 to x1 in form of [x0, x1]
     * @param yBounds Second arguments from y0 to y1 in form of [y0, y1]
     * @param triangles If area should be filled with triangles
     */
    drawArea(xBounds, yBounds, triangles = false) {
        this.triangles = triangles;
        this.points = [];
        this.normals = [];

        const scaleFactor = this.graphSize / Math.abs(xBounds[1] - xBounds[0]);

        for (let x = 0; x < this.fidelity; x++) {
            for (let y = 0; y < this.fidelity; y++) {
                const val = this.fn(
                    xBounds[0] + x * (xBounds[1] - xBounds[0]) / this.fidelity,
                    yBounds[0] + y * (yBounds[1] - yBounds[0]) / this.fidelity
                ) * scaleFactor;

                if (triangles) {
                    let nextY = null, nextX = null, nextYX = null;
                    if (y !== this.fidelity - 1) {
                        nextY = this.fn(
                            xBounds[0] + x * (xBounds[1] - xBounds[0]) / this.fidelity,
                            yBounds[0] + (y + 1) * (yBounds[1] - yBounds[0]) / this.fidelity
                        ) * scaleFactor;
                    }
                    if (x !== this.fidelity - 1) {
                        nextX = this.fn(
                            xBounds[0] + (x + 1) * (xBounds[1] - xBounds[0]) / this.fidelity,
                            yBounds[0] + y * (yBounds[1] - yBounds[0]) / this.fidelity
                        ) * scaleFactor;
                    }
                    if (x !== this.fidelity - 1 && y !== this.fidelity - 1) {
                        nextYX = this.fn(
                            xBounds[0] + (x + 1) * (xBounds[1] - xBounds[0]) / this.fidelity,
                            yBounds[0] + (y + 1) * (yBounds[1] - yBounds[0]) / this.fidelity
                        ) * scaleFactor;
                    }

                    if (nextX !== null && nextY !== null && nextYX !== null) {
                        const firstTriangle = [
                            x * this.graphSize / this.fidelity - this.graphSize / 2,
                            y * this.graphSize / this.fidelity - this.graphSize / 2,
                            val,
                            (x + 1) * this.graphSize / this.fidelity - this.graphSize / 2,
                            y * this.graphSize / this.fidelity - this.graphSize / 2,
                            nextX,
                            x * this.graphSize / this.fidelity - this.graphSize / 2,
                            (y + 1) * this.graphSize / this.fidelity - this.graphSize / 2,
                            nextY
                        ];

                        const secondTriangle = [
                            (x + 1) * this.graphSize / this.fidelity - this.graphSize / 2,
                            (y + 1) * this.graphSize / this.fidelity - this.graphSize / 2,
                            nextYX,
                            (x + 1) * this.graphSize / this.fidelity - this.graphSize / 2,
                            y * this.graphSize / this.fidelity - this.graphSize / 2,
                            nextX,
                            x * this.graphSize / this.fidelity - this.graphSize / 2,
                            (y + 1) * this.graphSize / this.fidelity - this.graphSize / 2,
                            nextY
                        ];

                        this.points.push(...firstTriangle, ...secondTriangle);
                        this.normals.push(
                            ...triangleNormal(firstTriangle),
                            ...triangleNormal(firstTriangle),
                            ...triangleNormal(firstTriangle),
                            ...triangleNormal(secondTriangle, true),
                            ...triangleNormal(secondTriangle, true),
                            ...triangleNormal(secondTriangle, true)
                        ); // push normal vector for each point
                    }
                } else {
                    this.points.push(
                        x * this.graphSize / this.fidelity - this.graphSize / 2,
                        y * this.graphSize / this.fidelity - this.graphSize / 2,
                        val
                    );
                }
            }
        }

        this.glInfo.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.glInfo.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.points), this.gl.STATIC_DRAW);

        if (this.triangles) {
            this.glInfo.normalBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.glInfo.normalBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.normals), this.gl.STATIC_DRAW);
        }
    }

    draw(worldView, projection) {
        this.gl.useProgram(this.glInfo.program);
        this.gl.enable(this.gl.DEPTH_TEST);

        this.gl.uniform1f(this.glInfo.fogNearLocation, 2000.0);
        this.gl.uniform1f(this.glInfo.forFarLocation, 5000.0);

        this.gl.uniform1f(this.glInfo.ambientLocation, 0.5);

        this.gl.uniformMatrix4fv(this.glInfo.worldViewLocation, false, worldView);
        this.gl.uniformMatrix4fv(this.glInfo.projectionLocation, false, projection);

        this.gl.uniform3fv(this.glInfo.reverseLightDirection, M4.normalize([0.5, 0.7, 1]));

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

        if (this.triangles) { // point surfaces don't use lighting
            this.gl.enableVertexAttribArray(this.glInfo.normalLocation);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.glInfo.normalBuffer);
            this.gl.vertexAttribPointer(
                this.glInfo.normalLocation,
                3,
                this.gl.FLOAT,
                false,
                0,
                0
            );
        }

        this.gl.drawArrays(
            this.triangles ? this.gl.TRIANGLES : this.gl.POINTS,
            0,
            this.triangles ? this.points.length / 3 : this.fidelity ** 2
        );
    }
}
