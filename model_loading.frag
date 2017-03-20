#version 330 core
in vec2 TexCoords;
out vec4 color;

in VS_OUT {
    vec3 position;
    vec3 normal;
    vec3 FragPos;
    vec4 fragPosLightSpace;
    vec2 TexCoord;
    vec4 newSpace;
} fs_in;

uniform sampler2D oneMap;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat4 lightSpaceMatrix;

uniform vec3 lightPos;
uniform vec3 lightColor;
uniform vec3 objectColor;

uniform sampler2D shadowMap;

const vec2 iResolution = vec2(800 * 2, 600 * 2);


float ShadowCalculation(vec4 fragPosLightSpace)
{
    // 执行透视除法
    vec3 projCoords = fragPosLightSpace.xyz / fs_in.fragPosLightSpace.w;
    // 变换到[0,1]的范围
    projCoords = projCoords * 0.5 + 0.5;
    // 取得最近点的深度(使用[0,1]范围下的fragPosLight当坐标)
    float closestDepth = texture(shadowMap, projCoords.xy).r;
    // 取得当前片元在光源视角下的深度
    float currentDepth = projCoords.z;
    // 检查当前片元是否在阴影中
    float shadow = currentDepth > closestDepth  ? 1.0 : 0.0;
    // 如果在阴影中返回1 否则返回0
    return shadow;
}


float pack(vec3 c)
{
    float lum = (c.x + c.y + c.z) * (1. / 3.);
    return lum;
}




void main()
{
    
    /*
     
     original color
     
     */
    
    
    
    
    vec3 projCoords = fs_in.newSpace.xyz / fs_in.newSpace.w;
    // 变换到[0,1]的范围
    projCoords = projCoords * 0.5 + 0.5;
    
    
    
    
    
    //            color =   (0.5 + (Factor / 18.0));
    //     color =  vec4(1.,0.5,0.6,1.);
    
    // Ambient
    float ambientStrength = 0.3f;
    vec3 ambient = ambientStrength * lightColor;
    
    // Diffuse
    vec3 norm = normalize(fs_in.normal);
    vec3 lightDir = normalize(lightPos - fs_in.FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;
    
    
    vec3 result = (ambient * 0.1 + diffuse) * objectColor;
    
    
    vec3 re_result = result + vec3(120. / 255);
    float result_f = pack(result);
    
    float k, kfang;
    
    if ( result_f > 0.75) {
        k = 10;
    }
    else if ( result_f > 0.55 && result_f <= 0.75){
        k = 7;
    }
    else if ( result_f > 0.5 && result_f <= 0.55){
        k = 5;
    }
    else if ( result_f > 0.25 && result_f <= 0.5){
        k = 3;
    }
    else if ( result_f > 0.04 && result_f <= 0.25){
        k = 1;
    } else {
        k = 1;
    }
    
    kfang = (k + k + 1) * (k + k + 1);
    
    float blurSizeH = 1.0 / 2000.0;
    float blurSizeV = 1.0 / 2000.0;
    vec4 sum = vec4(0.0);
    
    for (float x = 0 - k; x <= k; x++)
        for (float y = 0 - k; y <= k; y++)
            sum += texture(
                           oneMap,
                           vec2(projCoords.x + x * blurSizeH, projCoords.y + y * blurSizeV)
                           ) /kfang;
    color = sum;
    
    
    
    //    float diss = length((fs_in.position - lightPos));
    //    // diss > 5 6 的时候有点效果 可以省去腿
    //    if (diss > 6.)
    //    {
    //        color = texture(oneMap, projCoords.xy);
    //    }else
    //    {
    //        discard;
    //    }
    
}


//#version 330 core
//
//out vec4 color;
//
//const vec2 iResolution = vec2(800 * 2, 600 * 2);
//
//in VS_OUT {
//    vec2 texCoords;
//    vec3 normal;
//    vec3 FragPos;
//    vec4 fragPosLightSpace;
//} fs_in;
//
//
//uniform mat4 projection;
//uniform mat4 view;
//uniform mat4 model;
//uniform vec3 lightPos;
//uniform vec3 lightColor;
//uniform vec3 objectColor;
//
//
//
//float pack(vec3 c)
//{
//    float lum = (c.x + c.y + c.z) * (1. / 3.);
//    return lum;
//}
//
//
//
//void main()
//{
//
//    // Ambient
//    float ambientStrength = 0.3f;
//    vec3 ambient = ambientStrength * lightColor;
//
//    // Diffuse
//    vec3 norm = normalize(fs_in.normal);
//    vec3 lightDir = normalize(lightPos - fs_in.FragPos);
//    float diff = max(dot(norm, lightDir), 0.0);
//    vec3 diffuse = diff * lightColor;
//
//
//
//    vec3 result = (ambient * 0.1 + diffuse) * objectColor;
//
//
//    vec3 re_result = result + vec3(120. / 255);
//    float result_f = pack(result);
//
//    //    int a1 = 100/2;
//    //    int a2 = 1;
//
//
//
//
//    int a1 = 3/2;
//    int a2 = 2;
//
//
//
//    vec3 re_color;
//
//    if( result_f > 0.0){
//
//        re_color = vec3(255. / 255) / a1 + re_result / a2 ;
//
//    }
//    else {
//
//        re_color = vec3(29. / 255) / a1 + re_result / a2 ;
//
//    }
//
//    if( result_f > 0.9 ){
//
//        re_color = vec3(255. / 255) / a1 + re_result / a2 ;
//
//    }
//    else if ( result_f > 0.75 && result_f <= 0.9){
//
//        re_color = vec3(255. / 255) / a1 + re_result / a2 ;
//
//    }
//    else if ( result_f > 0.55 && result_f <= 0.75){
//
//        re_color = vec3(200. / 255) / a1 + re_result / a2 ;
//
//    }
//    else if ( result_f > 0.5 && result_f <= 0.55){
//
//        re_color = vec3(179. / 255) / a1 + re_result / a2 ;
//
//    }
//    else if ( result_f > 0.25 && result_f <= 0.5){
//
//        re_color = vec3(110. / 255) / a1 + re_result / a2 ;
//
//    }
//    else if ( result_f > 0.04 && result_f <= 0.25){
//
//        re_color = vec3(80. / 255) / a1 + re_result / a2 ;
//
//    }
//    else {
//
//        re_color = vec3(29. / 255) / a1 + re_result / a2 ;
//
//    }
//
//    //    re_color = result * 1.5;
//
//
//    color = vec4(re_color * 0.8, 1.0f);
//
//}



//#version 330 core
//#define EPSILON 0.00001
//
//
//const vec2 iResolution = vec2(800 * 2, 600 * 2);
//
//uniform sampler2D oneMap;
//uniform mat4 projection;
//uniform mat4 view;
//uniform mat4 model;
//uniform sampler2D shadowMap;
//uniform vec3 lightPos;
//uniform vec3 lightColor;
//uniform vec3 objectColor;
//
//in VS_OUT {
//    vec2 texCoords;
//    vec3 normal;
//    vec3 FragPos;
//    vec4 fragPosLightSpace;
//} fs_in;
//
//
//in vec2 TexCoords;
//
//out vec4 color;
//
//
//
//
//
//
//float LinearizeDepth(float depth)
//{
//    float near = 0.1;
//    float far = 100.0;
//    float z = depth * 2.0 - 1.0; // Back to NDC
//    return (2.0 * near) / (far + near - z * (far - near));
//}
//
//float pack(vec3 c)
//{
//    float lum = (c.x + c.y + c.z) * (1. / 3.);
//    return lum;
//}
//
//
//float ShadowCalculation(vec4 fragPosLightSpace)
//{
//    // 执行透视除法
//    vec3 projCoords = fragPosLightSpace.xyz / fs_in.fragPosLightSpace.w;
//    // 变换到[0,1]的范围
//    projCoords = projCoords * 0.5 + 0.5;
//    // 取得当前片元在光源视角下的深度
//    float currentDepth = projCoords.z;
//    // 检查当前片元是否在阴影中
//    float bias = 0.005;
//
//    float shadow = 0.0;
//    vec2 texelSize = 1.0 / textureSize(shadowMap, 0) ;
//    for(int x = -1; x <= 1; ++x)
//    {
//        for(int y = -1; y <= 1; ++y)
//        {
//            float pcfDepth = texture(shadowMap, projCoords.xy + vec2(x, y) * texelSize).r;
//            shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;
//        }
//    }
//    shadow /= 9.0;
//    return shadow;
//}
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
//void main()
//{
//
//    // Ambient
////    float ambientStrength = 0.3f;
////    vec3 ambient = ambientStrength * lightColor;
////
////    // Diffuse
////    vec3 norm = normalize(fs_in.normal);
////    vec3 lightDir = normalize(lightPos - fs_in.FragPos);
////    float diff = max(dot(norm, lightDir), 0.0);
////    vec3 diffuse = diff * lightColor;
////
////
////
////    vec3 result = (ambient * 0.1 + diffuse) * objectColor;
////
////
////    vec3 re_result = result + vec3(120. / 255);
////    float result_f = pack(result);
////
////    //    int a1 = 100/2;
////    //    int a2 = 1;
////
////
////
////
////    int a1 = 3/2;
////    int a2 = 2;
////
////
////
////    vec3 re_color;
////
////    if( result_f > 0.0){
////
////        re_color = vec3(255. / 255) / a1 + re_result / a2 ;
////
////    }
////    else {
////
////        re_color = vec3(29. / 255) / a1 + re_result / a2 ;
////
////    }
////
////    if( result_f > 0.9 ){
////
////        re_color = vec3(255. / 255) / a1 + re_result / a2 ;
////
////    }
////    else if ( result_f > 0.75 && result_f <= 0.9){
////
////        re_color = vec3(255. / 255) / a1 + re_result / a2 ;
////
////    }
////    else if ( result_f > 0.55 && result_f <= 0.75){
////
////        re_color = vec3(200. / 255) / a1 + re_result / a2 ;
////
////    }
////    else if ( result_f > 0.5 && result_f <= 0.55){
////
////        re_color = vec3(179. / 255) / a1 + re_result / a2 ;
////
////    }
////    else if ( result_f > 0.25 && result_f <= 0.5){
////
////        re_color = vec3(110. / 255) / a1 + re_result / a2 ;
////
////    }
////    else if ( result_f > 0.04 && result_f <= 0.25){
////
////        re_color = vec3(80. / 255) / a1 + re_result / a2 ;
////
////    }
////    else {
////
////        re_color = vec3(29. / 255) / a1 + re_result / a2 ;
////
////    }
//
////    re_color = result * 1.5;
//
//
////    color = vec4(re_color * 0.8, 1.0f);
//
//
//
//
//
////    float xOffset = 1.0/500;
////    float yOffset = 1.0/500;
////
////    vec4 Factor;
////
////    for (int y = -1 ; y <= 1 ; y++) {
////        for (int x = -1 ; x <= 1 ; x++) {
////            vec2 Offsets = vec2(x * xOffset, y * yOffset);
//////            vec2 UVC = vec2(fs_in.texCoords.st + Offsets);
////            Factor += texture(oneMap, fs_in.TexCoords + Offsets);
////        }
////    }
//
////     color =  Factor / 9.;
//
//
//    color = texture( oneMap, fs_in.texCoords);
//
//}