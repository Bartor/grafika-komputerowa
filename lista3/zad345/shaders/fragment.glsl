precision mediump float;

uniform float u_fogNear;
uniform float u_fogFar;

uniform vec3 u_reverseLightDirection;
uniform float u_ambient;

varying float v_fogDepth;
varying vec3 v_normal;

void main() {
    float fogAmount = smoothstep(u_fogNear, u_fogFar, v_fogDepth);
    vec3 normal = normalize(v_normal);

    float light = dot(normal, u_reverseLightDirection);

    gl_FragColor = vec4(0, 0.44, 1, 1);
    gl_FragColor.rgb *= max(min(light + u_ambient, 1.5), u_ambient);
    gl_FragColor = mix(gl_FragColor, vec4(1, 1, 1, 1), fogAmount);
}
