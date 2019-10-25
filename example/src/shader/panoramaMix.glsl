uniform mat4 uInvViewProjection;
uniform float uBarrelDistortion;
uniform float uMix;

vec2 getEqUV(vec3 rd) {
  vec2 uv = vec2(atan(rd.z, rd.x), asin(rd.y));
  uv *= vec2(0.1591,0.3183);
  uv.y += 0.5;
  return fract(uv);
}
void mainImage( out vec4 c, vec2 p ) {
    vec2 uv = vUV0 * 2. - 1.;
    float r2 = dot(uv,uv);
    uv.xy *= 1.0 + uBarrelDistortion * r2;
    vec4 rd = vec4(uv, 1., 1.);
    rd = uInvViewProjection * rd;
    rd.xyz = normalize(rd.xyz);
    vec2 euv = getEqUV(rd.xyz);
    c.xyz = mix( texture(iChannel0, euv).xyz, texture(iChannel1, euv).xyz, smoothstep(.4, .6, uMix));
}
