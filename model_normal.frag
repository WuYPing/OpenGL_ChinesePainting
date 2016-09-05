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

//the basic variables
uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform sampler2D shadowMap;


// Texture samplers
uniform sampler2D ourTexture1;
uniform vec2      tcOffset[25]; // Texture coordinate offsets


//for silhouette variables
in float gDist;
in vec2 gSpine;
in vec2 TexCoords;


//for blur variables
precision lowp float;
vec4 m_outColor;
vec2 m_outUV;
vec4 fcolor;


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
    // 如果在阴影中返回1 否则返回0
    return shadow;
}


void main()
{
    //    float depth = LinearizeDepth(gl_FragCoord.z);
    float ddd = ShadowCalculation(fs_in.fragPosLightSpace);
    
    float HalfWidth = 0.008;
    
    
    
    //    vec2 texCoord = gSpine;
    //    float depth = texture(shadowMap, vec2(0.0f, 1.0f)).r;
    //    if (depth < gl_FragCoord.z)
    //        discard;
    
    
    
    //    float alpha = 1.0;
    //    float d = abs(gDist);
    //    float tipLength = 2.0 * fwidth(d);
    //    if (d > HalfWidth - tipLength)
    //        alpha = 1.0 - (d - HalfWidth + tipLength) / tipLength;
    
    
    
    if(ddd == 0.0){
        //        color = vec4(vec3(ddd), 1.0f);
        
        
        
        // gaussian blur? THE ONLY ONE WORK FINE NOW
        //        vec4 sample0,sample1,sample2,sample3,sample4,sample5,sample6,sample7;
        //
        //        //the trick is fstep
        //        //set proper value could lead to good effection
        //        float fstep= 0.055;
        //        sample0=texture(ourTexture1,TexCoords+ vec2(-fstep,-fstep));
        //        sample1=texture(ourTexture1,TexCoords+ vec2(+fstep,-fstep));
        //        sample2=texture(ourTexture1,TexCoords+ vec2(+fstep,+fstep));
        //        sample3=texture(ourTexture1,TexCoords+ vec2(-fstep,+fstep));
        //        sample4=texture(ourTexture1,TexCoords+ vec2(-fstep,0));
        //        sample5=texture(ourTexture1,TexCoords+ vec2(+fstep,0));
        //        sample6=texture(ourTexture1,TexCoords+ vec2(0,-fstep));
        //        sample7=texture(ourTexture1,TexCoords+ vec2(0,+fstep));
        //
        //        vec4 fcolor=(sample0+sample1+sample2+sample3+sample4+sample5+sample6+sample7) / 8.0;
        //        color =  fcolor;
        
        
        
        //Sepia tone
        //        float grey = dot(texture(ourTexture1, TexCoords).rgb, vec3(0.299, 0.587, 0.114));
        //
        //        // Play with these rgb weightings to get different tones.
        //        // (As long as all rgb weightings add up to 1.0 you won't lighten or darken the image)
        //        color = vec4(grey * vec3(1.2, 1.0, 0.8), 1.0);
        
        
        
        
        
        // Blur (mean filter)
        //        fcolor = vec4(0.0);
        //        for (int i = 0; i < 50; i++)
        //        {
        //            // Sample a grid around and including our texel
        //            fcolor += texture(ourTexture1, TexCoords + tcOffset[i]);
        //        }
        //        // Divide by the number of samples to get our mean
        //        fcolor /= 50;
        //        color = fcolor;
        
        
        
        
        // Blur (gaussian)
        //        vec4 sample[25];
        //        for (int i = 0; i < 25; i++)
        //        {
        //            // Sample a grid around and including our texel
        //            sample[i] = texture(ourTexture1, TexCoords + tcOffset[i]);
        //        }
        //        // Gaussian weighting:
        //        // 1  4  7  4 1
        //        // 4 16 26 16 4
        //        // 7 26 41 26 7 / 273 (i.e. divide by total of weightings)
        //        // 4 16 26 16 4
        //        // 1  4  7  4 1
        //        fcolor = (
        //                       (1.0  * (sample[0] + sample[4]  + sample[20] + sample[24])) +
        //                       (4.0  * (sample[1] + sample[3]  + sample[5]  + sample[9] + sample[15] + sample[19] + sample[21] + sample[23])) +
        //                       (7.0  * (sample[2] + sample[10] + sample[14] + sample[22])) +
        //                       (16.0 * (sample[6] + sample[8]  + sample[16] + sample[18])) +
        //                       (26.0 * (sample[7] + sample[11] + sample[13] + sample[17])) +
        //                       (41.0 * sample[12])
        //                       ) / 273.0;
        //        color = fcolor;
        
        
        
        
        
        
        //the original one
        color = texture(ourTexture1, TexCoords);
    }else{
        discard;
    }
    
    //color = vec4(vec3(gl_FragCoord.z), 1.0f);
}