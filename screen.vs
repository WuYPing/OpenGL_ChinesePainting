#version 330 core
layout (location = 0) in vec2 position;
layout (location = 1) in vec2 texCoords;


uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat4 lightSpaceMatrix;

out vec2 TexCoords;

void main()
{
    gl_Position = vec4(position.x, position.y, 0.0f, 1.0f);
//    gl_Position = lightSpaceMatrix * model * vec4(position, 1.0f);
    TexCoords = texCoords;
}