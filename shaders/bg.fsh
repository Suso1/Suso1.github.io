#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform float time;
uniform vec2 mouse;
uniform vec2 dims;

varying vec2 texpos;

// psrdnoise (c) Stefan Gustavson and Ian McEwan,
// ver. 2021-12-02, published under the MIT license:
// https://github.com/stegu/psrdnoise/
float psrdnoise(vec2 x, vec2 period, float alpha, out vec2 gradient) {
  vec2 uv = vec2(x.x + x.y * 0.5, x.y);
  vec2 i0 = floor(uv), f0 = fract(uv);
  float cmp = step(f0.y, f0.x);
  vec2 o1 = vec2(cmp, 1.0 - cmp);
  vec2 i1 = i0 + o1, i2 = i0 + 1.0;
  vec2 v0 = vec2(i0.x - i0.y * 0.5, i0.y);
  vec2 v1 = vec2(v0.x + o1.x - o1.y * 0.5, v0.y + o1.y);
  vec2 v2 = vec2(v0.x + 0.5, v0.y + 1.0);
  vec2 x0 = x - v0, x1 = x - v1, x2 = x - v2;
  vec3 iu, iv, xw, yw;
  if(any(greaterThan(period, vec2(0.0)))) {
    xw = vec3(v0.x, v1.x, v2.x);
    yw = vec3(v0.y, v1.y, v2.y);
    if(period.x > 0.0)
      xw = mod(vec3(v0.x, v1.x, v2.x), period.x);
    if(period.y > 0.0)
      yw = mod(vec3(v0.y, v1.y, v2.y), period.y);
    iu = floor(xw + 0.5 * yw + 0.5);
    iv = floor(yw + 0.5);
  } else {
    iu = vec3(i0.x, i1.x, i2.x);
    iv = vec3(i0.y, i1.y, i2.y);
  }
  vec3 hash = mod(iu, 289.0);
  hash = mod((hash * 51.0 + 2.0) * hash + iv, 289.0);
  hash = mod((hash * 34.0 + 10.0) * hash, 289.0);
  vec3 psi = hash * 0.07482 + alpha;
  vec3 gx = cos(psi);
  vec3 gy = sin(psi);
  vec2 g0 = vec2(gx.x, gy.x);
  vec2 g1 = vec2(gx.y, gy.y);
  vec2 g2 = vec2(gx.z, gy.z);
  vec3 w = 0.8 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2));
  w = max(w, 0.0);
  vec3 w2 = w * w;
  vec3 w4 = w2 * w2;
  vec3 gdotx = vec3(dot(g0, x0), dot(g1, x1), dot(g2, x2));
  float n = dot(w4, gdotx);
  vec3 w3 = w2 * w;
  vec3 dw = -8.0 * w3 * gdotx;
  vec2 dn0 = w4.x * g0 + dw.x * x0;
  vec2 dn1 = w4.y * g1 + dw.y * x1;
  vec2 dn2 = w4.z * g2 + dw.z * x2;
  gradient = 10.9 * (dn0 + dn1 + dn2);
  return 10.9 * n;
}

float psrdfbmr(vec2 p, vec2 period, float alpha) {
  const mat2 m = mat2(0.8, -0.6, 0.6, 0.8);
  float f = 0.0;
  vec2 g1, g2, g3, g4;
  f += 0.5000 * psrdnoise(p, period, alpha, g1);
  p = 2.0 * m * p;
  period = m * period;
  alpha *= -2.0;
  f += 0.2500 * psrdnoise(p, period, alpha, g2);
  p = 2.0 * m * p;
  period = m * period;
  alpha *= -2.0;
  f += 0.1250 * psrdnoise(p, period, alpha, g3);
  p = 2.0 * m * p;
  period = m * period;
  alpha *= -2.0;
  f += 0.0625 * psrdnoise(p, period, alpha, g4);
  return f / 0.9375;
}

float aastep(float threshold, float value) {
  float afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));
  return smoothstep(threshold - afwidth, threshold + afwidth, value);
}

void main(void) {
  vec2 g;

  // Circular noise
  const vec4 ring_color = vec4(0.42, 0.0, 0.81, 1.0);
  vec2 effpos = texpos / 10.0 - 0.12;
  effpos.x *= dims.x / dims.y;
  float r = length(effpos);
  float theta = atan(effpos.y, effpos.x) / (3.141592 * 2.0);
  vec2 effmouse = mouse / 10.0 - 0.12;
  effmouse.x *= dims.x / dims.y;
  float mouse_dist = distance(effmouse, effpos);
  float nse = psrdfbmr(effpos * 100.0 , vec2(0.0), time);
  float ring_dist = 0.15 -mouse_dist * 50.0 + nse * 0.07;

  vec4 color = ring_color * aastep(0.0, -ring_dist) * (psrdfbmr(vec2(r - time * 0.01, theta + r) * 10.0, vec2(0.0, 1.0), 0.0) + 1.0) / 2.0;
  color += ring_color * (1.2 - pow(distance(clamp(abs(ring_dist) - 0.01, 0.0, 100.0), 0.0), 0.3));
  color += pow(clamp(1.0 - sqrt(distance(clamp(abs(ring_dist) - 0.01, 0.0, 100.0), 0.0)), 0.0, 1.0), 9.0);

  // Vignette
  color.rgb *= vec3(clamp(1.0 - pow(length(texpos - 0.5) * 1.5, 2.0), 0.0, 1.0));

  gl_FragColor = color;
}
