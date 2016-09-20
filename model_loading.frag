#version 330 core
in vec2 TexCoords;

out vec4 color;

in VS_OUT {
    vec2 texCoords;
    vec3 normal;
    vec3 FragPos;
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

void main()
{
    //    float depth = LinearizeDepth(gl_FragCoord.z);
    //    float depth2 = texture(shadowMap, fs_in.texCoords).r;
    //    color = vec4(vec3(depth2), 1.0f);
    //    color = vec4(vec3(gl_FragCoord.z), 1.0f);
    
    
//    color = vec4(vec3(0.97f,0.75f,0.76f), 1.0f);
    
    // Ambient
    float ambientStrength = 0.3f;
    vec3 ambient = ambientStrength * lightColor;
    
    // Diffuse
    vec3 norm = normalize(fs_in.normal);
    vec3 lightDir = normalize(lightPos - fs_in.FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;
    
    vec3 result = (ambient + diffuse) * objectColor;
    color = vec4(result, 1.0f);
}