attribute vec3 a_position;
attribute vec4 a_color;
varying vec4 v_color;

void main() {
    gl_Position = vec4((a_position - 0.5) * vec3(2), 1.0);
    v_color = a_color;
}