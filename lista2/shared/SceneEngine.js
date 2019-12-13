class SceneEngine {
    constructor() {
        this.root = new SceneNode();
    }

    draw() {
        this.root.draw();
    }
}

class SceneNode {
    constructor(shape) {
        this.children = [];
        this.localMatrix = M4.identity();
        this.worldMatrix = M4.identity();

        this.parent = null;
        this.shape = shape;
    }

    appendChild(childNode) {
        this.children.push(childNode);
    }

    removeChild(childNode) {
        let idx = this.children.indexOf(childNode);
        if (idx !== -1) {
            this.children.splice(idx, 1);
        }
    }

    setParent(parentNode) {
        if (this.parent) {
            this.parent.removeChild(this);
        }

        parentNode.appendChild(this);
    }

    updateWorldMatrix(worldMatrix) {
        if (worldMatrix) {
            this.worldMatrix = M4.multiply(this.localMatrix, worldMatrix);
        } else {
            this.worldMatrix = M4.copy(this.localMatrix);
        }

        this.children.forEach(child => {
           child.updateWorldMatrix(this.worldMatrix);
        });
    }

    draw() {
        this.updateWorldMatrix();
        if (this.shape) this.shape.draw(this.worldMatrix);
        this.children.forEach(child => {
            child.draw();
        });
    }
}

class Square {
    /**
     * Constructs a new Square from (0, 0) to (width, height)
     * @param gl WebGLRenderingContext
     * @param program WebGLProgram
     * @param width Square's width
     * @param height Square's height
     * @param color Color vector; [r, g, b, a]
     */
    constructor(gl, program, width, height, color = new Float32Array([0, 0, 0, 1])) {
        this.drawer = new BufferedDrawer(gl, program);

        let positions = [
            0, 0, 0,
            width, 0, 0,
            width, height, 0,
            0, 0, 0,
            0, height, 0,
            width, height, 0,
        ];

        let colors = new Array(positions.length / 3 * 4).fill(0).map((_, i) => color[i % 4]);

        this.drawer.bufferPositions(positions);
        this.drawer.bufferColors(colors);
    }

    draw(transformMatrix) {
        this.drawer.draw(transformMatrix);
    }
}

class BufferedDrawer {
    constructor(gl, program) {
        this.gl = gl;
        this.program = program;
        this.drawCounts = 0;

        this.positionBuffer = this.gl.createBuffer();
        this.colorBuffer = this.gl.createBuffer();

        this.transformMatrixLocation = this.gl.getUniformLocation(program, 'u_matrix');
        this.positionLocation = this.gl.getAttribLocation(program, 'a_position');
        this.colorLocation = this.gl.getAttribLocation(program, 'a_color');
    }

    bufferPositions(positions) {
        this.drawCounts = positions.length / 3; // (x, y, z, w)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    }

    bufferColors(colors) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
    }

    draw(transformMatrix) {
        this.gl.useProgram(this.program);
        this.gl.enable(this.gl.DEPTH_TEST); // enable depth pixels

        const projectedMatrix = M4.project(transformMatrix, this.gl.canvas.width, this.gl.canvas.height); // project clip space to pixels
        this.gl.uniformMatrix4fv(this.transformMatrixLocation, false, projectedMatrix); // set transform matrix uniform

        this.gl.enableVertexAttribArray(this.positionLocation); // bind position pointers
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(
            this.positionLocation,
            3, // (x, y, z)
            this.gl.FLOAT,
            false,
            0,
            0
        );

        this.gl.enableVertexAttribArray(this.colorLocation); // bind color pointers
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.vertexAttribPointer(
            this.colorLocation,
            4, // (r, g, b, a)
            this.gl.FLOAT,
            false,
            0,
            0
        );

        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.drawCounts); // draw
    }
}