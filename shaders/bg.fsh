#ifdef GL_ES
precision highp float;
#endif

uniform float time;

varying vec2 texpos;

void main(void) {
    gl_FragColor = vec4(0.004, 0.0, 0.133, 1.0);
}
