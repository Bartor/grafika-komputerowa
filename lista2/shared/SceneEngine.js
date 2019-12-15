class SceneEngine {
    constructor(background, width, height) {
        this.projection = M4.projection(width, height);

        this.root = new SceneNode();
        this.background = background;
        this.background.updateWorldMatrix(this.projection);
    }

    updateProjectionMatrix(width, height) {
        this.projection = M4.projection(width, height);
        this.background.updateWorldMatrix(this.projection);
    }

    draw() {
        this.root.updateWorldMatrix(this.projection);
        this.root.draw();
        this.background.draw();
    }
}

class SceneNode {
    constructor(shape = null) {
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

        this.parent = parentNode;
        parentNode.appendChild(this);
    }

    updateWorldMatrix(worldMatrix) {
        if (worldMatrix) {
            M4.multiply(worldMatrix, this.localMatrix, this.worldMatrix);
        } else {
            M4.copy(this.localMatrix, this.worldMatrix);
        }

        this.children.forEach(child => {
           child.updateWorldMatrix(this.worldMatrix);
        });
    }

    draw() {
        if (this.shape)  {
            this.shape.draw(this.worldMatrix);
        }
        this.children.forEach(child => {
            child.draw();
        });
    }
}


/* !abstract! */class Shape {
    constructor(gl, program) {
        this.drawer = new BufferedDrawer(gl, program);
        this.hitbox = []
    }

    /* private */buffer(positions, colors) {
        this.drawer.bufferPositions(positions);
        this.drawer.bufferColors(colors);
    }

    draw(transformMatrix) {
        this.drawer.draw(transformMatrix);
    }
}

class Square extends Shape {
    constructor(gl, program, width, height, color = new Float32Array([0, 0, 0, 1])) {
        super(gl, program);

        let positions = [
            0, 0, 0,
            width, 0, 0,
            width, height, 0,
            0, 0, 0,
            0, height, 0,
            width, height, 0,
        ];

        let colors = new Array(positions.length / 3 * 4).fill(0).map((_, i) => color[i % 4]);
        this.buffer(positions, colors);
    }
}

class GoodGuy extends Shape {
    constructor(gl, program, size, color = new Float32Array([0, 0, 0, 1])) {
        super(gl, program);

        let positions = [
            2*size/5, 0, 0,
            2*size/5, 4*size/6, 0,
            0, 4*size/6, 0,
            3*size/5, 0, 0,
            3*size/5, 4*size/6, 0,
            size, 4*size/6, 0,
            0, 5*size/6, 0,
            2*size/5, 5*size/6, 0,
            2*size/5, size, 0,
            3*size/5, 5*size/6, 0,
            size, 5*size/6, 0,
            3*size/5, size, 0
        ];

        let colors = new Array(positions.length / 3 * 4).fill(0).map((_, i) => color[i % 4]);
        this.buffer(positions, colors);
    }
}

class BadGuy extends Shape {
    constructor(gl, program, size, color = new Float32Array([0, 0, 0, 1])) {
        super(gl, program);

        let positions = [
            0, size/2, 0,
            size/2, 0, 0,
            size/2, size/3, 0,
            size/2, 0, 0,
            size/2, size/3, 0,
            size, size/2, 0
        ];

        let colors = new Array(positions.length / 3 * 4).fill(0).map((_, i) => color[i % 4]);
        this.buffer(positions, colors);
    }
}

class Star extends Shape {
    constructor(gl, program, size, color = new Float32Array([0, 0, 0, 1])) {
        super(gl, program);
        let positions = [
            0, 0, 0,
            size, 0, 0,
            size/2, 3/4*size, 0,
            size/2, -1/4*size, 0,
            0, 1/2*size, 0,
            size, 1/2*size, 0
        ];

        let colors = new Array(positions.length / 3 * 4).fill(0).map((_, i) => color[i % 4]);
        this.buffer(positions, colors);
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
        this.drawCounts = positions.length / 3; // (x, y, z)
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

        this.gl.uniformMatrix4fv(this.transformMatrixLocation, false, transformMatrix); // set transform matrix uniform

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
