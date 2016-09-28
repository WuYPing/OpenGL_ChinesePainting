#version 330 core
in vec2 TexCoords;

out vec4 color;

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
    
    vec3 result = (ambient * 0.1 + diffuse) * objectColor;
    
    vec3 re_color;
    
    if( result.x > 0.8 ){
        
        re_color = vec3(1.0, 1.0, 1.0);
    }
    //diffusion
    else if ( result.x > 0.75 && result.x <= 0.8){
        re_color = result / 3 + vec3(1.0, 1.0, 1.0) / 2;
    }
    else if ( result.x > 0.55 && result.x <= 0.75){
        re_color = vec3(0.7, 0.7, 0.7);
        
    }
    //diffusion
    else if ( result.x > 0.5 && result.x <= 0.55){
        re_color = result / 3 + vec3(0.7, 0.7, 0.7) / 2;
    }
    else if ( result.x > 0.25 && result.x <= 0.5){
        re_color = vec3(0.4, 0.4, 0.4);
        
    }
    //diffusion
    else if ( result.x > 0.15 && result.x <= 0.25){
        re_color = result / 3 + vec3(0.4, 0.4, 0.4) / 2;
    }
    else {
        re_color = vec3(0.0, 0.0, 0.0);
    }
    
    
    re_color = result * 2;
    
    color = vec4(re_color, 1.0f);
    
    
    
}