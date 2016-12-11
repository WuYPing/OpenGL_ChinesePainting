#version 330 core
in vec2 TexCoords;

out vec4 color;

const vec2 iResolution = vec2(800 * 2, 600 * 2);

in VS_OUT {
    vec2 texCoords;
    vec3 normal;
    vec3 FragPos;
    vec4 fragPosLightSpace;
} fs_in;

uniform sampler2D texture_diffuse1;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform sampler2D shadowMap;
uniform vec3 lightPos;
uniform vec3 lightColor;
uniform vec3 objectColor;


float LinearizeDepth(float depth)
{
    float near = 0.1;
    float far = 100.0;
    float z = depth * 2.0 - 1.0; // Back to NDC
    return (2.0 * near) / (far + near - z * (far - near));
}

float pack(vec3 c)
{
    float lum = (c.x + c.y + c.z) * (1. / 3.);
    return lum;
}


float ShadowCalculation(vec4 fragPosLightSpace)
{
    // 执行透视除法
    vec3 projCoords = fragPosLightSpace.xyz / fs_in.fragPosLightSpace.w;
    // 变换到[0,1]的范围
    projCoords = projCoords * 0.5 + 0.5;
    // 取得当前片元在光源视角下的深度
    float currentDepth = projCoords.z;
    // 检查当前片元是否在阴影中
    float bias = 0.005;
    
    float shadow = 0.0;
    vec2 texelSize = 1.0 / textureSize(shadowMap, 0) ;
    for(int x = -1; x <= 1; ++x)
    {
        for(int y = -1; y <= 1; ++y)
        {
            float pcfDepth = texture(shadowMap, projCoords.xy + vec2(x, y) * texelSize).r;
            shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;
        }
    }
    shadow /= 9.0;
    return shadow;
}


/*
 
 random things
 
 */
vec2 newUV;

float rand(float n){return fract(sin(n) * 43758.5453123);}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float noise(float p){
    float fl = floor(p);
    float fc = fract(p);
    return mix(rand(fl), rand(fl + 1.0), fc);
}

float noise(vec2 n) {
    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}




/*
 
 perlin noise
 
 */

vec2 hash22(vec2 p)
{
    p = vec2( dot(p,vec2(127.1,311.7)),
             dot(p,vec2(269.5,183.3)));
    
    return -1.0 + 2.0 * fract(sin(p)*43758.5453123);
}

float perlin_noise(vec2 p)
{
    vec2 i = floor( p );
    vec2 f = fract( p );
    
    // Ease Curve
    //vec2 u = f*f*(3.0-2.0*f);
    vec2 u = f*f*f*(6.0*f*f - 15.0*f + 10.0);
    
    return mix( mix( dot( hash22( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                    dot( hash22( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
               mix( dot( hash22( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                   dot( hash22( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

float noise_sum_abs(vec2 p)
{
    float f = 0.0;
    p = p * 7.0;
    f += 1.0000 * abs(noise(p)); p = 2.0 * p;
    f += 0.5000 * abs(noise(p)); p = 2.0 * p;
    f += 0.2500 * abs(noise(p)); p = 2.0 * p;
    f += 0.1250 * abs(noise(p)); p = 2.0 * p;
    f += 0.0625 * abs(noise(p)); p = 2.0 * p;
    
    return f;
}



void main()
{
    //    float depth = LinearizeDepth(gl_FragCoord.z);
    //    float depth2 = texture(shadowMap, fs_in.texCoords).r;
    //    color = vec4(vec3(depth2), 1.0f);
    //    color = vec4(vec3(gl_FragCoord.z), 1.0f);
    //    color = vec4(vec3(0.97f,0.75f,0.76f), 1.0f);
    
    
    //for PCF percentage-closer filtering
    float ddd = ShadowCalculation(fs_in.fragPosLightSpace);
    
    // Ambient
    float ambientStrength = 0.3f;
    vec3 ambient = ambientStrength * lightColor;
    
    // Diffuse
    vec3 norm = normalize(fs_in.normal);
    vec3 lightDir = normalize(lightPos - fs_in.FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;
    
    // Perlin noise
    vec2 p = fs_in.texCoords.xy;
    
    vec2 uv = p * vec2(iResolution.x/iResolution.y,1.0);
    
    float f = 0.0;
    
    
    f = perlin_noise( 16.0 * vec2(diffuse));

    f = 0.5 + 0.5*f;
    
    // 分割线：注意如果第三个参数超过了限定范围就不进行插值
    f *= smoothstep(0.0, 0.005, abs(p.x-0.2));
    f *= smoothstep(0.0, 0.005, abs(p.x-0.4));
    f *= smoothstep(0.0, 0.005, abs(p.x-0.6));
    f *= smoothstep(0.0, 0.005, abs(p.x-0.8));
    //        color = vec4( f, f, f, 1.0 );
    
    
    
    
    
    
    vec3 result = (ambient * 0.1 + diffuse) * objectColor;
    
    
    vec3 re_result = result + vec3(120. / 255);
    float result_f = pack(result);
    
    //    int a1 = 100/2;
    //    int a2 = 1;
    
    
    
  
    int a1 = 3/2;
    int a2 = 2;
    

    
    vec3 re_color;
    
    if( result_f > f){
        
        re_color = vec3(255. / 255) / a1 + re_result / a2 ;
        
    }
    else {
        
        re_color = vec3(29. / 255) / a1 + re_result / a2 ;
        
    }
    
    if( result_f > 0.9 ){
        
        re_color = vec3(255. / 255) / a1 + re_result / a2 ;
        
    }
    else if ( result_f > 0.75 && result_f <= 0.9){
        
        re_color = vec3(255. / 255) / a1 + re_result / a2 ;
        
    }
    else if ( result_f > 0.55 && result_f <= 0.75){
        
        re_color = vec3(200. / 255) / a1 + re_result / a2 ;
        
    }
    else if ( result_f > 0.5 && result_f <= 0.55){
        
        re_color = vec3(179. / 255) / a1 + re_result / a2 ;
        
    }
    else if ( result_f > 0.25 && result_f <= 0.5){
        
        re_color = vec3(110. / 255) / a1 + re_result / a2 ;
        
    }
    else if ( result_f > 0.04 && result_f <= 0.25){
        
        re_color = vec3(80. / 255) / a1 + re_result / a2 ;
        
    }
    else {
        
        re_color = vec3(29. / 255) / a1 + re_result / a2 ;
        
    }
    
    re_color = result * 2;
    
    
    color = vec4(re_color * 0.8, 1.0f);
  
}