#version 330 core
layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoords;


uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat4 lightSpaceMatrix;
out vec3 vNormal;

void main()
{
    gl_Position = lightSpaceMatrix * model * vec4(position, 1.0f);
    vNormal = normal;
}