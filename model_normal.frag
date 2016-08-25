#version 330 core
out vec4 color;
//in vec3 sssnormal;

in VS_OUT {
    vec3 position;
    vec3 normal;
    vec3 FragPos;
    vec4 fragPosLightSpace;
    vec2 TexCoord;
} fs_in;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform sampler2D shadowMap;
// Texture samplers
uniform sampler2D ourTexture1;

in float gDist;
in vec2 gSpine;
in vec2 TexCoords;

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
    // 取得最近点的深度(使用[0,1]范围下的fragPosLight当坐标)
    float closestDepth = texture(shadowMap, projCoords.xy).r;
    // 取得当前片元在光源视角下的深度
    float currentDepth = projCoords.z;
    // 检查当前片元是否在阴影中
    float bias = 0.005;
    float shadow = currentDepth - bias> closestDepth  ? 1.0 : 0.0;
    
    return shadow;
}


void main()
{
    //    float depth = LinearizeDepth(gl_FragCoord.z);
    float ddd = ShadowCalculation(fs_in.fragPosLightSpace);
    
    float HalfWidth = 0.008;
    
    
    
    vec2 texCoord = gSpine;
    float depth = texture(shadowMap, texCoord).r;
    if (depth < gl_FragCoord.z)
        discard;
    
    
    
    float alpha = 1.0;
    float d = abs(gDist);
    float tipLength = 2.0 * fwidth(d);
    if (d > HalfWidth - tipLength)
        alpha = 1.0 - (d - HalfWidth + tipLength) / tipLength;
    
    
    
    if(ddd < 0.5){
//                color = vec4(vec3(ddd), alpha);
        
        color = texture(ourTexture1, TexCoords);
    }else{
        discard;
    }
    
    //color = vec4(vec3(gl_FragCoord.z), 1.0f);
}