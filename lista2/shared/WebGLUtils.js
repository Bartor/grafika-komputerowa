class WebGLUtils {
    static resizeCanvas(gl, canvasElement) {
        let displayWidth = canvasElement.clientWidth;
        let displayHeight = canvasElement.clientHeight;

        if (canvasElement.width !== displayWidth || canvasElement.height !== displayHeight) {
            canvasElement.width = displayWidth;
            canvasElement.height = displayHeight;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }
    }

    static createShader(gl, type, source) {
        return new Promise((resolve, reject) => {
            fetch(source).then(code => code.text().then(src => {
                let shader = gl.createShader(type);
                gl.shaderSource(shader, src);
                gl.compileShader(shader);
                if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    resolve(shader);
                } else {
                    reject(gl.getShaderInfoLog(shader));
                    gl.deleteShader(shader);
                }
            }));
        });
    }

    static createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            return program;
        } else {
            console.log(gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
        }
    }

}
