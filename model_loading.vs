#version 330 core
layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoords;

out VS_OUT {
    vec2 texCoords;
    vec3 normal;
    vec3 FragPos;
} vs_out;


out vec3 vvvview;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;


void main()
{
    
    mat3 normalMatrix = mat3(transpose(inverse(view * model)));
    
    mat3 nomatrix =  mat3(transpose(inverse(model)));
    
    vs_out.normal = vec3(projection * vec4(normalMatrix * normal, 1.0));
    
    gl_Position = projection * view * model * vec4(position, 1.0f);
    
    vs_out.texCoords = texCoords;
    
    vs_out.FragPos = vec3(model * vec4(position, 1.0));
    
}