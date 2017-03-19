#version 330 core
layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoords;

out VS_OUT {
    vec3 position;
    vec3 normal;
    vec3 FragPos;
    vec4 fragPosLightSpace;
    vec2 TexCoord;
    vec4 newSpace;
} vs_out;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat4 lightSpaceMatrix;

out vec2 TexCoords;

void main()
{
//        gl_Position = vec4(position.x, position.y, 0.0f, 1.0f);
//        gl_Position = lightSpaceMatrix * model * vec4(position, 1.0f);
    gl_Position = projection * view * model * vec4(position, 1.0f);
    TexCoords = texCoords;
    mat3 normalMatrix = mat3(transpose(inverse(view * model)));
    vs_out.position = position;
    vs_out.normal = vec3(projection * vec4(normalMatrix * normal, 1.0));
    vs_out.FragPos = vec3(model * vec4(position, 1.0));
    vs_out.fragPosLightSpace = lightSpaceMatrix  * vec4(vs_out.FragPos, 1.0);
    vs_out.newSpace = projection * view  * vec4(vs_out.FragPos, 1.0);
    vs_out.TexCoord = texCoords;
}


//#version 330 core
//layout (location = 0) in vec3 position;
//layout (location = 1) in vec3 normal;
//layout (location = 2) in vec2 texCoords;
//
//out VS_OUT {
//    vec2 texCoords;
//    vec3 normal;
//    vec3 FragPos;
//    vec4 fragPosLightSpace;
//} vs_out;
//
//
//uniform mat4 projection;
//uniform mat4 view;
//uniform mat4 model;
//uniform mat4 lightSpaceMatrix;
//
//
//
//void main()
//{
//    
//    
//    // move the position along the normal and transform it
//    //    vec3 newPosition = position - normal * f / 20;
//    
//    //    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
//    
//    
//    
//    mat3 normalMatrix = mat3(transpose(inverse(view * model)));
//    
//    mat3 nomatrix =  mat3(transpose(inverse(model)));
//    
//    gl_Position = projection * view * model * vec4(position, 1.0f);
//    
//    
//    vs_out.normal = vec3(projection * vec4(normalMatrix * normal, 1.0));
//    
//    vs_out.texCoords = texCoords;
//    
//    vs_out.FragPos = vec3(model * vec4(position, 1.0));
//    
//    vs_out.fragPosLightSpace = lightSpaceMatrix * vec4(vs_out.FragPos, 1.0);
//    
//    
//    
//    
//}




//#version 330 core
//layout (location = 0) in vec3 position;
//layout (location = 1) in vec3 normal;
//layout (location = 2) in vec2 texCoords;
//
//out VS_OUT {
//    vec2 texCoords;
//    vec3 normal;
//    vec3 FragPos;
//    vec4 fragPosLightSpace;
//} vs_out;
//
//
//out vec2 TexCoords;
//
//uniform mat4 projection;
//uniform mat4 view;
//uniform mat4 model;
//uniform mat4 lightSpaceMatrix;
//
//const vec2 iResolution = vec2(800 * 2, 600 * 2);
//
//
///*
//
// random things
//
// */
//vec2 newUV;
//
//float rand(float n){return fract(sin(n) * 43758.5453123);}
//
//float rand(vec2 co){
//    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
//}
//
//float noise(float p){
//    float fl = floor(p);
//    float fc = fract(p);
//    return mix(rand(fl), rand(fl + 1.0), fc);
//}
//
//float noise(vec2 n) {
//    const vec2 d = vec2(0.0, 1.0);
//    vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
//    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
//}
//
//
//
//
///*
//
// perlin noise
//
// */
//
//vec2 hash22(vec2 p)
//{
//    p = vec2( dot(p,vec2(127.1,311.7)),
//             dot(p,vec2(269.5,183.3)));
//
//    return -1.0 + 2.0 * fract(sin(p)*43758.5453123);
//}
//
//float perlin_noise(vec2 p)
//{
//    vec2 i = floor( p );
//    vec2 f = fract( p );
//
//    // Ease Curve
//    //vec2 u = f*f*(3.0-2.0*f);
//    vec2 u = f*f*f*(6.0*f*f - 15.0*f + 10.0);
//
//    return mix( mix( dot( hash22( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
//                    dot( hash22( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
//               mix( dot( hash22( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
//                   dot( hash22( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
//}
//
//float noise_sum_abs(vec2 p)
//{
//    float f = 0.0;
//    p = p * 7.0;
//    f += 1.0000 * abs(noise(p)); p = 2.0 * p;
//    f += 0.5000 * abs(noise(p)); p = 2.0 * p;
//    f += 0.2500 * abs(noise(p)); p = 2.0 * p;
//    f += 0.1250 * abs(noise(p)); p = 2.0 * p;
//    f += 0.0625 * abs(noise(p)); p = 2.0 * p;
//
//    return f;
//}
//
//
//
///*
//
// turbulance
//
// */
//
////float turbulence( vec3 p ) {
////    float w = 100.0;
////    float t = -.5;
////    for (float f = 1.0 ; f <= 10.0 ; f++ ){
////        float power = pow( 2.0, f );
////        t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
////    }
////    return t;
////}
//
//
//void main()
//{
//
//    // Perlin noise
//    vec2 p = position.xy + position.yz + position.zx;
//
//    vec2 uv = p * vec2(iResolution.x/iResolution.y,1.0);
//
//    float f = 0.0;
//
//
//    f = perlin_noise( 16.0 * vec2(position.xy + position.yz + position.zx));
//
//    f = 0.5 + 0.5*f;
//
//    // 分割线：注意如果第三个参数超过了限定范围就不进行插值
//    f *= smoothstep(0.0, 0.005, abs(p.x-0.2));
//    f *= smoothstep(0.0, 0.005, abs(p.x-0.4));
//    f *= smoothstep(0.0, 0.005, abs(p.x-0.6));
//    f *= smoothstep(0.0, 0.005, abs(p.x-0.8));
//    //        color = vec4( f, f, f, 1.0 );
//
//
//
//
//
//    // move the position along the normal and transform it
////    vec3 newPosition = position - normal * f / 20;
//
////    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
//
//
//
//    mat3 normalMatrix = mat3(transpose(inverse(view * model)));
//
//    mat3 nomatrix =  mat3(transpose(inverse(model)));
//
//    gl_Position = projection * view * model * vec4(position, 1.0f);
//
//     TexCoords = texCoords;
//
//    vs_out.normal = vec3(projection * vec4(normalMatrix * normal, 1.0));
//
//    vs_out.texCoords = texCoords;
//
//    vs_out.FragPos = vec3(model * vec4(position, 1.0));
//
//    vs_out.fragPosLightSpace = lightSpaceMatrix * vec4(vs_out.FragPos, 1.0);
//
//
//
//
//}