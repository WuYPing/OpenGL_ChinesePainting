#version 330 core
in vec2 TexCoords;
out vec4 color;

uniform sampler2D screenTexture;
const float offset = 1.0 / 1000;

void main()
{
    //    color = vec4(vec3(1.0 - texture(screenTexture, TexCoords)), 1.0);
//    color =texture(screenTexture, TexCoords);
    //    color =vec4(0.0f,1.0f,1.0f,1.0f);
    
    
    
    //            vec4 sample0,sample1,sample2,sample3,sample4,sample5,sample6,sample7;
    //
    //            //the trick is fstep
    //            //set proper value could lead to good effection
    //            float fstep= 0.003;
    //            sample0=texture(screenTexture,TexCoords+ vec2(-fstep,-fstep));
    //            sample1=texture(screenTexture,TexCoords+ vec2(+fstep,-fstep));
    //            sample2=texture(screenTexture,TexCoords+ vec2(+fstep,+fstep));
    //            sample3=texture(screenTexture,TexCoords+ vec2(-fstep,+fstep));
    //            sample4=texture(screenTexture,TexCoords+ vec2(-fstep,0));
    //            sample5=texture(screenTexture,TexCoords+ vec2(+fstep,0));
    //            sample6=texture(screenTexture,TexCoords+ vec2(0,-fstep));
    //            sample7=texture(screenTexture,TexCoords+ vec2(0,+fstep));
    //
    //            vec4 fcolor=(sample0+sample1+sample2+sample3+sample4+sample5+sample6+sample7) / 8.0;
    //            color =  fcolor;
    
    
    vec2 offsets[9] = vec2[](
                             vec2(-offset, offset),  // top-left
                             vec2(0.0f,    offset),  // top-center
                             vec2(offset,  offset),  // top-right
                             vec2(-offset, 0.0f),    // center-left
                             vec2(0.0f,    0.0f),    // center-center
                             vec2(offset,  0.0f),    // center-right
                             vec2(-offset, -offset), // bottom-left
                             vec2(0.0f,    -offset), // bottom-center
                             vec2(offset,  -offset)  // bottom-right
                             );
    
    
    

    
    float kernel[9] = float[](
                              1, 1, 1,
                              1, 7, 1,
                              1, 1, 1
                              );
    

    
    vec4 sampleTex[9];
    for(int i = 0; i < 9; i++)
    {
        sampleTex[i] = texture(screenTexture, TexCoords.st + offsets[i]);
    }
    
    
    
    vec3 col = vec3(0.0);
    for(int i = 0; i < 9; i++)
        col += vec3(sampleTex[i]) * kernel[i];
    
    col = col/9;
    color = vec4(col, 1.0);

    
    
    
    
    
    //    float blurSizeH = 1.0 / 2000.0;
    //    float blurSizeV = 1.0 / 2000.0;
    //    vec4 sum = vec4(0.0);
    //    for (int x = -4; x <= 4; x++)
    //        for (int y = -4; y <= 4; y++)
    //            sum += texture(
    //                           screenTexture,
    //                           vec2(TexCoords.x + x * blurSizeH, TexCoords.y + y * blurSizeV)
    //                           ) / 81.0;
    //    color = sum;
    
    
    
    
}