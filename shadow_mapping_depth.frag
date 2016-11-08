#version 330 core

in vec3 vNormal;
out vec3 fColor;

void main()
{
    gl_FragDepth = gl_FragCoord.z;
//    fColor = (vNormal + 1.0) * 0.5;
    fColor = vNormal * 0.5 - 0.5;
}