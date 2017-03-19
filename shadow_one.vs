#version 330 core
layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoords;

out VS_OUT {
    vec2 texCoords;
    vec3 normal;
    vec3 FragPos;
    vec4 fragPosLightSpace;
        vec4 newSpace;
} vs_out;


uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat4 lightSpaceMatrix;


void main()
{

    
    // move the position along the normal and transform it
//    vec3 newPosition = position - normal * f / 20;
    
//    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
    
   
    
    mat3 normalMatrix = mat3(transpose(inverse(view * model)));
    
    mat3 nomatrix =  mat3(transpose(inverse(model)));
    
    gl_Position = projection * view * model * vec4(position, 1.0f);

    vs_out.normal = vec3(projection * vec4(normalMatrix * normal, 1.0));
    
    vs_out.texCoords = texCoords;
    
    vs_out.FragPos = vec3(model * vec4(position, 1.0));
    
    vs_out.fragPosLightSpace = lightSpaceMatrix * vec4(vs_out.FragPos, 1.0);
     vs_out.newSpace = projection * view  * vec4(vs_out.FragPos, 1.0);
    
    
   
    
}