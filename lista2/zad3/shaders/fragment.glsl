precision mediump float;
varying vec4 v_color;
varying vec2 v_texcoord;

uniform sampler2D u_texture;
uniform float u_tex;

void main() {
    if (u_tex == 1.0) {
        gl_FragColor = texture2D(u_texture, v_texcoord);
    } else {
        gl_FragColor = v_color;
    }
}
