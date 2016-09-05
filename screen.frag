#version 330 core
in vec2 TexCoords;
out vec4 color;

uniform sampler2D screenTexture;

void main()
{
    color = vec4(vec3(1.0 - texture(screenTexture, TexCoords)), 1.0);
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
}