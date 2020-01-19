attribute vec4 a_position;
attribute vec3 a_normal;

uniform mat4 u_worldView;
uniform mat4 u_projection;

varying float v_fogDepth;
varying vec3 v_normal;

void main() {
    gl_Position = u_projection * u_worldView * a_position;
    gl_PointSize = 5.0;

    v_fogDepth = -(u_worldView * a_position).z;
    v_normal = a_normal;
}
