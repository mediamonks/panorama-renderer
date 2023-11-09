uniform mat4 uInvViewProjection;
uniform float uBarrelDistortion;
uniform float uMix;

vec2 getEqUV(vec3 rd) {
  vec2 uv = vec2(atan(rd.z, rd.x), asin(rd.y));
  uv *= vec2(0.1591, 0.3183);
  uv.y += 0.5;
  return fract(uv);
}

vec3 getCol(sampler2D tex, vec3 rd) {
  vec2 uv1 = getEqUV(rd.xyz);
  vec3 col1 = texture(tex, uv1).xyz;
  vec2 uv2 = uv1;
  uv2.x = fract(uv2.x + 0.5) - 0.5;
  vec3 col2 = texture(tex, uv2).xyz;
  return mix(col1, col2, step(abs(uv2.x), 0.25));
}

void mainImage(out vec4 c, vec2 p) {
  vec2 uv = vUV0 * 2. - 1.;
  float r2 = dot(uv, uv);
  uv.xy *= 1.0 + uBarrelDistortion * r2;
  vec3 rd = normalize((uInvViewProjection * vec4(uv, 1., 1.)).xyz);
  c.xyz = mix(getCol(iChannel0, rd.xyz), getCol(iChannel1, rd.xyz), smoothstep(.4, .6, uMix));
  c.w = 1.;
}
