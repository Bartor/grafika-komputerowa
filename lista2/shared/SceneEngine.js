class SceneEngine {
    constructor() {
        this.root = new SceneNode();
    }
}

class SceneNode {
    constructor() {
        this.children = [];
        this.localMatrix = M4.identity();
        this.worldMatrix = M4.identity();

        this.parent = null;
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
}

class Square {
    /**
     * Constructs a new Square from (0, 0) to (width, height)
     * @param gl WebGLRenderingContext
     * @param width Square's width
     * @param height Square's height
     * @param color Color vector; [r, g, b, a]
     */
    constructor(gl, width, height, color) {
        this.drawer = new BufferedDrawer(gl);

        let positions = [
            0, 0, 0, 1,
            width, 0, 0, 1,
            width, height, 0, 1,
            0, 0, 0, 1,
            0, height, 0, 1,
            width, height, 0, 1
        ];

        let colors = new Array(positions.length * 4).fill(0).map((_, i) => color[i % 4]);

        this.drawer.bufferPositions(positions);
        this.drawer.bufferColors(colors);
    }

    draw(positionsLocation, colorLocation, transformMatrixLocation, transformMatrix) {
        // todo rethink this parameter mess
    }
}

class BufferedDrawer {
    constructor(gl) {
        this.gl = gl;
        this.drawCounts = 0;

        this.positionsBuffer = this.gl.createBuffer();
        this.colorBuffer = this.gl.createBuffer();
    }

    bufferPositions(positions) {
        this.drawCounts = positions / 4; // (x, y, z, w)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionsBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    }

    bufferColors(colors) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
    }

    draw(positionLocation, colorLocation) {
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionsBuffer);
        this.gl.vertexAttribPointer(
            positionLocation,
            4, // (x, y, z, w)
            this.gl.FLOAT,
            false,
            0,
            0
        );

        this.gl.enableVertexAttribArray(colorLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionsBuffer);
        this.gl.vertexAttribPointer(
            colorLocation,
            4, // (r, g, b, a)
            this.gl.FLOAT,
            false,
            0,
            0
        );

        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.drawCounts);
    }
}