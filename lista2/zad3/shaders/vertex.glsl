attribute vec4 a_position;
attribute vec4 a_color;
attribute vec2 a_texcoord;

uniform mat4 u_matrix;

varying vec4 v_color;
varying vec2 v_texcoord;

void main() {
    gl_Position = u_matrix * a_position;
    v_color = a_color;
    v_texcoord = a_texcoord;
}
