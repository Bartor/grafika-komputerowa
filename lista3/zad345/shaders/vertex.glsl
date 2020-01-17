attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_matrix;

varying vec4 v_color;

void main() {
    gl_Position = u_matrix * a_position;
    gl_PointSize = 5.0;

    v_color = vec4(0, 0.44, 1, 1);
}