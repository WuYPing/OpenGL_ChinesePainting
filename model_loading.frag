#version 330 core
in vec2 TexCoords;

out vec4 color;

in VS_OUT {
    vec2 texCoords;
    vec3 normal;
} fs_in;

uniform sampler2D texture_diffuse1;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;


float LinearizeDepth(float depth)
{
    float near = 0.1;
    float far = 100.0;
    float z = depth * 2.0 - 1.0; // Back to NDC
    return (2.0 * near) / (far + near - z * (far - near));
}

void main()
{
    float depth = LinearizeDepth(gl_FragCoord.z);
//    color = vec4(vec3(depth), 1.0f);
    color = vec4(vec3(gl_FragCoord.z), 1.0f);
}