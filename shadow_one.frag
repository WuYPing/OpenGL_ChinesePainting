#version 330 core

out vec4 FragColor;

const vec2 iResolution = vec2(800 * 2, 600 * 2);

in VS_OUT {
    vec2 texCoords;
    vec3 normal;
    vec3 FragPos;
    vec4 fragPosLightSpace;
} fs_in;


uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform vec3 lightPos;
uniform vec3 lightColor;
uniform vec3 objectColor;


float pack(vec3 c)
{
    float lum = (c.x + c.y + c.z) * (1. / 3.);
    return lum;
}



void main()
{
 
    // Ambient
    float ambientStrength = 0.3f;
    vec3 ambient = ambientStrength * lightColor;
    
    // Diffuse
    vec3 norm = normalize(fs_in.normal);
    vec3 lightDir = normalize(lightPos - fs_in.FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;
    
    
    
    vec3 result = (ambient * 0.1 + diffuse) * objectColor;
    
    
    vec3 re_result = result + vec3(120. / 255);
    float result_f = pack(result);
    
    //    int a1 = 100/2;
    //    int a2 = 1;
    
    
    
  
    int a1 = 3/2;
    int a2 = 2;
    

    
    vec3 re_color;
    
    if( result_f > 0.0){
        
        re_color = vec3(255. / 255) / a1 + re_result / a2 ;
        
    }
    else {
        
        re_color = vec3(29. / 255) / a1 + re_result / a2 ;
        
    }
    
    if( result_f > 0.9 ){
        
        re_color = vec3(255. / 255) / a1 + re_result / a2 ;
        
    }
    else if ( result_f > 0.75 && result_f <= 0.9){
        
        re_color = vec3(255. / 255) / a1 + re_result / a2 ;
        
    }
    else if ( result_f > 0.55 && result_f <= 0.75){
        
        re_color = vec3(200. / 255) / a1 + re_result / a2 ;
        
    }
    else if ( result_f > 0.5 && result_f <= 0.55){
        
        re_color = vec3(179. / 255) / a1 + re_result / a2 ;
        
    }
    else if ( result_f > 0.25 && result_f <= 0.5){
        
        re_color = vec3(110. / 255) / a1 + re_result / a2 ;
        
    }
    else if ( result_f > 0.04 && result_f <= 0.25){
        
        re_color = vec3(80. / 255) / a1 + re_result / a2 ;
        
    }
    else {
        
        re_color = vec3(29. / 255) / a1 + re_result / a2 ;
        
    }
    
//    re_color = result * 1.5;
    
    
//    color = vec4(re_color * 0.8, 1.0f);
    FragColor = vec4(re_color * 0.8, 1.0f);

  
}