#version 330 core
layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoord;

out VS_OUT {
    vec3 position;
    vec3 normal;
    vec3 FragPos;
    vec4 fragPosLightSpace;
    vec2 TexCoord;
} vs_out;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat4 lightSpaceMatrix;


void main()
{
    gl_Position = projection * view * model * vec4(position, 1.0f);
    mat3 normalMatrix = mat3(transpose(inverse(view * model)));
    vs_out.position = position;
    vs_out.normal = vec3(projection * vec4(normalMatrix * normal, 1.0));
    vs_out.FragPos = vec3(model * vec4(position, 1.0));
    vs_out.fragPosLightSpace = lightSpaceMatrix * vec4(vs_out.FragPos, 1.0);
    vs_out.TexCoord = texCoord;


}