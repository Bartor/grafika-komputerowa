let html = null;
let gl = null;

let linear = 0;

/* shaders */
let vertexShader = null;
let fragmentShader = null;
/* shader program */
let shaderProgram = null;

/* vertex attributes locations */
let position = null;

/* uniform variables locations */
let projection = null;
let view = null;
let skybox = null;


/* input vertices of cube triangles */
let xPlusFloat32Array = new Float32Array([
    +1, +1, +1,
    +1, -1, +1,
    +1, -1, -1,
    +1, +1, -1,
]);
let xMinusFloat32Array = new Float32Array([
    -1, +1, -1,
    -1, -1, -1,
    -1, -1, +1,
    -1, +1, +1,
]);

let yPlusFloat32Array = new Float32Array([
    -1, 1, -1,
    -1, 1, +1,
    +1, 1, +1,
    +1, 1, -1,
]);
let yMinusFloat32Array = new Float32Array([
    -1, -1, +1,
    -1, -1, -1,
    +1, -1, -1,
    +1, -1, +1,
]);

let zPlusFloat32Array = new Float32Array([
    -1, +1, 1,
    -1, -1, 1,
    +1, -1, 1,
    +1, +1, 1,
]);
let zMinusFloat32Array = new Float32Array([
    +1, +1, -1,
    +1, -1, -1,
    -1, -1, -1,
    -1, +1, -1,
]);

let texCoordsFloat32Array = new Float32Array([
    0, 0,
    0, 1,
    1, 1,
    1, 0,
]);


let arrayBuffer = null;

/* texture parameters */
// let textureId=null;
// let textureUnit=0; // default

let vertexShaderSource = "" +
    "attribute vec3 aPosition;\n" +
    "attribute vec2 aTexCoords;\n" +
    "varying vec2 TexCoords;\n" +
    "uniform mat4 projection;\n" +
    "uniform mat4 rotation;\n" +
    "uniform vec3 move;\n" +
    "void main()\n" +
    "{\n" +
    "    vec4 pos = rotation * vec4(aPosition, 1.0) + vec4(move, 0.0);\n" +
    "    gl_Position =  projection * pos;\n" +
    "    TexCoords = aTexCoords;\n" +
    "}\n";

let fragmentShaderSource = "" +
    "precision mediump float;\n" +
    "varying vec2 TexCoords;\n" +
    "uniform sampler2D tex2D;\n" +
    "void main()\n" +
    "{\n" +
    "    gl_FragColor = texture2D(tex2D, TexCoords);\n" +
    "}\n";

let makeShaderProgram = function (gl) {
    /* Parameters:
       gl - WebGL context
    */

    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader));
        return null;
    }

    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(fragmentShader));
        return null;
    }

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log("Could not initialise shaders");
        return null;
    }

    gl.useProgram(shaderProgram);

    /* set vertex attributes locations */
    aPositionLocation = gl.getAttribLocation(shaderProgram, "aPosition");
    aTexCoordsLocation = gl.getAttribLocation(shaderProgram, "aTexCoords");

    /* set uniform variables locations */
    projectionLocation = gl.getUniformLocation(shaderProgram, "projection");
    rotationLocation = gl.getUniformLocation(shaderProgram, "rotation");
    moveLocation = gl.getUniformLocation(shaderProgram, "move");
    tex2DLocation = gl.getUniformLocation(shaderProgram, "tex2D");

    /* load  data buffers */
    zMinusArrayBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, zMinusArrayBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, zMinusFloat32Array, gl.STATIC_DRAW);

    zPlusArrayBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, zPlusArrayBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, zPlusFloat32Array, gl.STATIC_DRAW);

    xMinusArrayBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, xMinusArrayBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, xMinusFloat32Array, gl.STATIC_DRAW);

    xPlusArrayBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, xPlusArrayBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, xPlusFloat32Array, gl.STATIC_DRAW);

    yMinusArrayBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, yMinusArrayBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, yMinusFloat32Array, gl.STATIC_DRAW);

    yPlusArrayBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, yPlusArrayBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, yPlusFloat32Array, gl.STATIC_DRAW);

    texCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoordsFloat32Array, gl.STATIC_DRAW);

    // SUCCESS
    return shaderProgram;
};

let drawBufferFace = function (gl, rotation, move, projection, buffer, textureId, textureUnit, filtering) {
    /* Parameters:
       gl - WebGL context
       view, projection - gl matrices 4x4 (column major)
       textureUnit - integer from [0 ... gl.MAX_TEXTURE_IMAGE_UNITS]
    */
    gl.depthFunc(gl.LESS);

    gl.useProgram(shaderProgram);

    gl.uniformMatrix4fv(rotationLocation, false, rotation);
    gl.uniform3fv(moveLocation, move);
    gl.uniformMatrix4fv(projectionLocation, false, projection);

    gl.enableVertexAttribArray(aPositionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(aTexCoordsLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);
    gl.vertexAttribPointer(aTexCoordsLocation, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.uniform1i(tex2DLocation, textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, textureId);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filtering);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filtering);


    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

let createTexture2D = function (gl) {
    /* parameters:
       gl -  WebGL contex
       textureUnit - texture unit to which the texture should be bound
    */
    let textureId = gl.createTexture();
    // gl.activeTexture(gl.TEXTURE0+textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, textureId);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return textureId;
}

let loadTexture2DFromCanvas = function (gl, canvas, textureId) {
    /* use after  makeShaderProgram(gl) */
    /* Parameters:
       gl - WebGL context
       canvas - container of the image
       textureId - ID returned by  createMyTexture2D
       textureUnit - texture unit to which the texture should be bound
    */
    // gl.activeTexture(gl.TEXTURE0+textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, textureId);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
};


let cubeFace; // array of cube face direction constants
let skyboxXYZ; // array of argument mappings for skybox functions


/**  Model-view and projection  matrices **/

const PROJECTION_Z_NEAR = 0.25;
const PROJECTION_Z_FAR = 300;
const PROJECTION_ZOOM_Y = 4.0;


const identityMatrix4 = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
];


let rotationMatrix4 = identityMatrix4;

let moveVector = [0, 0, 10];


let createProjectionMatrix4 = function (gl, zNear, zFar, zoomY) {
    /* arguments:
       gl - GL context
       zNear, zFar, zoomY - Y-frustum parameters 

       returns: 4x4 row-major order perspective matrix
    */
    let xx = zoomY * gl.viewportHeight / gl.viewportWidth;
    let yy = zoomY;
    let zz = (zFar + zNear) / (zFar - zNear);
    let zw = 1;
    let wz = -2 * zFar * zNear / (zFar - zNear);
    return [
        [xx, 0, 0, 0],
        [0, yy, 0, 0],
        [0, 0, zz, wz],
        [0, 0, zw, 0]
    ];
}


let glVector3 = function (x, y, z) {
    return new Float32Array(x, y, z);
};


let glMatrix4 = function (xx, yx, zx, wx,
                          xy, yy, zy, wy,
                          xz, yz, zz, wz,
                          xw, yw, zw, ww) {
    // sequence of concatenated columns
    return new Float32Array([xx, xy, xz, xw,
        yx, yy, yz, yw,
        zx, zy, zz, zw,
        wx, wy, wz, ww]);
};

let glMatrix4FromMatrix = function (m) {
    /* arguments:
       m - the 4x4 array with the matrix in row-major order 

       returns: sequence of elements in column-major order in Float32Array for GL
    */
    return glMatrix4(
        m[0][0], m[0][1], m[0][2], m[0][3],
        m[1][0], m[1][1], m[1][2], m[1][3],
        m[2][0], m[2][1], m[2][2], m[2][3],
        m[3][0], m[3][1], m[3][2], m[3][3]
    );
};


let scalarProduct4 = function (v, w) {
    return v[0] * w[0] + v[1] * w[1] + v[2] * w[2] + v[3] * w[3];
};

let matrix4Column = function (m, c) {
    return [m[0][c], m[1][c], m[2][c], m[3][c]];
};

let matrix4Product = function (m1, m2) {
    let sp = scalarProduct4;
    let col = matrix4Column;
    return [
        [sp(m1[0], col(m2, 0)), sp(m1[0], col(m2, 1)), sp(m1[0], col(m2, 2)), sp(m1[0], col(m2, 3))],
        [sp(m1[1], col(m2, 0)), sp(m1[1], col(m2, 1)), sp(m1[1], col(m2, 2)), sp(m1[1], col(m2, 3))],
        [sp(m1[2], col(m2, 0)), sp(m1[2], col(m2, 1)), sp(m1[2], col(m2, 2)), sp(m1[1], col(m2, 3))],
        [sp(m1[3], col(m2, 0)), sp(m1[3], col(m2, 1)), sp(m1[3], col(m2, 2)), sp(m1[3], col(m2, 3))]
    ];
};

let matrix4RotatedXZ = function (matrix, alpha) {
    let c = Math.cos(alpha);
    let s = Math.sin(alpha);
    let rot = [[c, 0, -s, 0],
        [0, 1, 0, 0],
        [s, 0, c, 0],
        [0, 0, 0, 1]
    ];

    return matrix4Product(rot, matrix);
};

let matrix4RotatedYZ = function (matrix, alpha) {
    let c = Math.cos(alpha);
    let s = Math.sin(alpha);
    let rot = [[1, 0, 0, 0],
        [0, c, -s, 0],
        [0, s, c, 0],
        [0, 0, 0, 1]
    ];

    return matrix4Product(rot, matrix);
};


/* redraw variables */

let boxFaceTextures = [];

let redraw = function () {
    let projectionMatrix = glMatrix4FromMatrix(createProjectionMatrix4(gl,
        PROJECTION_Z_NEAR,
        PROJECTION_Z_FAR,
        PROJECTION_ZOOM_Y)
    );
    let rotationMatrix = glMatrix4FromMatrix(rotationMatrix4); //tmp

    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const filtering = [
        gl.NEAREST,
        gl.LINEAR,
        gl.NEAREST_MIPMAP_NEAREST,
        gl.NEAREST_MIPMAP_LINEAR,
        gl.LINEAR_MIPMAP_NEAREST,
        gl.LINEAR_MIPMAP_LINEAR
    ][linear];

    console.log([
        'nearest',
        'linear',
        'nearest mipmap nearest',
        'nearest mipmap linear',
        'linear mipmap nearest',
        'linear mipmap linear'
    ][linear]);

    drawBufferFace(gl, rotationMatrix, moveVector, projectionMatrix,
        xPlusArrayBuffer, boxFaceTextures[0], 1, filtering);
    drawBufferFace(gl, rotationMatrix, moveVector, projectionMatrix,
        xMinusArrayBuffer, boxFaceTextures[1], 2, filtering);

    drawBufferFace(gl, rotationMatrix, moveVector, projectionMatrix,
        yPlusArrayBuffer, boxFaceTextures[2], 3, filtering);
    drawBufferFace(gl, rotationMatrix, moveVector, projectionMatrix,
        yMinusArrayBuffer, boxFaceTextures[3], 4, filtering);

    drawBufferFace(gl, rotationMatrix, moveVector, projectionMatrix,
        zPlusArrayBuffer, boxFaceTextures[4], 5, filtering);
    drawBufferFace(gl, rotationMatrix, moveVector, projectionMatrix,
        zMinusArrayBuffer, boxFaceTextures[5], 6, filtering);

    sbx_drawSkybox(gl,
        rotationMatrix,
        projectionMatrix
    );
}

onWindowResize = function () {
    let wth = parseInt(window.innerWidth) - 10;
    let hth = parseInt(window.innerHeight) - 10;
    canvasGL.setAttribute("width", '' + wth);
    canvasGL.setAttribute("height", '' + hth);
    gl.viewportWidth = wth;
    gl.viewportHeight = hth;
    gl.viewport(0, 0, wth, hth);
    redraw();
};


function onKeyDown(e) {
    // let code=e.keyCode? e.keyCode : e.charCode;
    let code = e.which || e.keyCode;
    let alpha = Math.PI / 32;
    switch (code) {
        case 38: // up
        case 73: // I
            rotationMatrix4 = matrix4RotatedYZ(rotationMatrix4, alpha);
            break;
        case 40: // down
        case 75: // K
            rotationMatrix4 = matrix4RotatedYZ(rotationMatrix4, -alpha);
            break;
        case 37: // left
        case 74:// J
            rotationMatrix4 = matrix4RotatedXZ(rotationMatrix4, -alpha);
            break;
        case 39:// right
        case 76: // L
            rotationMatrix4 = matrix4RotatedXZ(rotationMatrix4, alpha);
            break;
        case 70: // F
            moveVector[2]++;
            break;
        case 66: // B
        case 86: // V
            moveVector[2]--;
            break;
        case 32: // space
            rotationMatrix4 = identityMatrix4;
            break;

        // case 77: // M
        case 82: // R
            linear = (linear + 1) % 6;
            redraw();
        /* case 81: // Q
         case 69: // E
         case 191: // ?
         case 68: // D
         case 13: // enter
         case 187: // +
         case 27: // escape
         case 189: // -
         case 86: // V
         case 46: // Delete
         case 51: // #
         case 83: // S
         case 65: // A
         case 56: // *
         case 88: // X
         case 74: // J
         break;
       */
    }
    redraw();
}


window.onload = function () {
    html = {};
    html.canvasGL = document.querySelector('#canvasGL');
    html.canvasTex = document.querySelector('#canvasTex');
    gl = canvasGL.getContext("webgl");


    cubeFace = [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    ];

    skyboxXYZ = [
        sbx_xyzXPlus, sbx_xyzXMinus,
        sbx_xyzYPlus, sbx_xyzYMinus,
        sbx_xyzZPlus, sbx_xyzZMinus
    ];


    boxFaceTextures = [];

    makeShaderProgram(gl);
    sbx_makeShaderProgram(gl);

    let fun = sbx_fun;
    let r = Math.floor(Math.random() * fun.length);
    let g = Math.floor(Math.random() * fun.length);
    let b = Math.floor(Math.random() * fun.length);
    for (let skyboxStep = 0; skyboxStep < 6; skyboxStep++) {
        sbx_fillCanvasUpsideDown(canvasTex, sbx_createFunctionRGB(fun[r], fun[g], fun[b], skyboxXYZ[skyboxStep]));
        sbx_loadCubeFaceFromCanvas(gl, canvasTex, cubeFace[skyboxStep]);
        boxFaceTextures.push(loadTexture(gl, gl.NEAREST));
    }

    onWindowResize();
    window.onresize = onWindowResize;
    window.onkeydown = onKeyDown;
}

function loadTexture(gl, filtering) {
    const text = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, text);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 255, 0, 255]));

    const img = new Image();
    img.addEventListener('load', () => {
        gl.bindTexture(gl.TEXTURE_2D, text);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filtering);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filtering);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if ((img.width & (img.width - 1)) === 0 && (img.height & (img.height - 1)) === 0) gl.generateMipmap(gl.TEXTURE_2D);
        redraw();
    });
    img.src = 'text.png';

    return text;
}
