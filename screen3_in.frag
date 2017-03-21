#version 330 core


#define SORT_SIZE  3


/*
 
 original
 
 */

uniform sampler2D screenTexture;
const float offset = 1.0 / 500;
in vec2 TexCoords;
out vec4 color;



/*
 
 median
 
 */

float sort[SORT_SIZE];
float medians[SORT_SIZE];

float pack(vec3 c)
{
    float lum = (c.x + c.y + c.z) * (1. / 3.);
    
    return lum;
}

vec3 unpack(float x)
{
    return vec3(x);
}

#define SWAP(a,b) { float t = sort[a]; sort[a] = sort[b]; sort[b] = t; }
void bubble_sort(int num)// 简单的冒泡排序
{
    // 把最小值移到最左边
    for(int j = 0; j < num; ++j)
    {
        for(int i= num-1; i >j; --i)
        {
            if(sort[i] < sort[i-1])
            {
                SWAP(i, i-1);
            }
        }
    }
}

const vec2 iResolution = vec2(800*2, 600*2);



/*
 
 noise diffusion
 
 */

uniform sampler2D noiseTexture;
uniform float uQuantLevel;   // 2-6
uniform float uWaterPower;   // 8-64
uniform float xxnumber;
//决定粒子颗粒大小 一部分
const vec2 texSize = vec2(256, 256);

vec2 vUV;

vec4 quant(vec4 cl, float n)
{
    cl.x = floor(cl.x * 255./n)*n/255.;
    cl.y = floor(cl.y * 255./n)*n/255.;
    cl.z = floor(cl.z * 255./n)*n/255.;
    
    return cl;
}

vec4 dip_fil(mat3 fil, vec2 fil_pos_delta[9],
             sampler2D image, vec2 xy, vec2 texSize)
{
    vec4 final_color = vec4(0., 0., 0., 0.);
    
    for(int i=0; i<3; i++)
    {
        for(int j=0; j<3; j++)
        {
            vec2 new_xy = vec2(xy.x + fil_pos_delta[3*i+j].x,
                               xy.y + fil_pos_delta[3*i+j].y);
            vec2 new_uv = vec2(new_xy.x / texSize.x, new_xy.y / texSize.y);
            final_color += texture(screenTexture, TexCoords + new_uv/600) * fil[i][j];
            
            //new_uv/500 也决定了偏移大小
        }
    }
    
    
    return final_color;
}



/*
 
 KURAHARA Filter
 
 */
float sampleGray[9];
float f_rel[4];
void preSamGary(){
    vec2 ooRes = vec2(1.) / iResolution.xy;
    //SORT_SIZE个列
    for (int j=0; j<3; j++)
    {
        //SORT_SIZE个行
        for (int i=0; i<3; i++)
        {
            vec2 uv = (TexCoords.xy + vec2(i,j)-vec2(3/2)) * ooRes;
            
            float c = pack( texture(screenTexture, TexCoords + uv).rgb );
            
            sampleGray[3 * j + i] = c;
        }
    }
}

//求平方
float sq(float x) { return x*x;}

//计算方差
float calVari(int a, int b, int c, int d) {
    
    float re_var;
    
    float even_n = (sampleGray[a] + sampleGray[b] + sampleGray[c] + sampleGray[d]) / 4;
    
    re_var += sq(sampleGray[a] - even_n);
    re_var += sq(sampleGray[b] - even_n);
    re_var += sq(sampleGray[c] - even_n);
    re_var += sq(sampleGray[d] - even_n);
    
    re_var = re_var / 4;
    return re_var;
}

//比较算出最小值
int compare(float fff[4]){
    
    int rere = 0;
    
    for (int i = 0; i < 4; i++) {
        if (fff[i] < fff[rere]) {
            rere = i;
        }
    }
    
    //    float q = min(min(min(fff[0], fff[1]), fff[2]), fff[3]);
    
    return rere;
}

//算平均值
float calEven(int a, int b, int c, int d) {
    
    float even_n = (sampleGray[a] + sampleGray[b] + sampleGray[c] + sampleGray[d]) / 4;
    
    return even_n;
}



/*
 
 random things
 
 */
vec2 newUV;

float rand(float n){return fract(sin(n) * 43758.5453123);}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float noise(float p){
    float fl = floor(p);
    float fc = fract(p);
    return mix(rand(fl), rand(fl + 1.0), fc);
}

float noise(vec2 n) {
    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}


/*
 
 perlin noise
 
 */

vec2 hash22(vec2 p)
{
    p = vec2( dot(p,vec2(127.1,311.7)),
             dot(p,vec2(269.5,183.3)));
    
    return -1.0 + 2.0 * fract(sin(p)*43758.5453123);
}

float perlin_noise(vec2 p)
{
    vec2 i = floor( p );
    vec2 f = fract( p );
    
    // Ease Curve
    //vec2 u = f*f*(3.0-2.0*f);
    vec2 u = f*f*f*(6.0*f*f - 15.0*f + 10.0);
    
    return mix( mix( dot( hash22( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                    dot( hash22( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
               mix( dot( hash22( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                   dot( hash22( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

float noise_sum_abs(vec2 p)
{
    float f = 0.0;
    p = p * 7.0;
    f += 1.0000 * abs(noise(p)); p = 2.0 * p;
    f += 0.5000 * abs(noise(p)); p = 2.0 * p;
    f += 0.2500 * abs(noise(p)); p = 2.0 * p;
    f += 0.1250 * abs(noise(p)); p = 2.0 * p;
    f += 0.0625 * abs(noise(p)); p = 2.0 * p;
    
    return f;
}

void main()
{
    
    /*
     
     original color
     
     */
    
//    color = texture( screenTexture, TexCoords);
    
    
    
    /*
     
     water color one
     
     */
    
        vec4 noiseColor = uWaterPower * texture(noiseTexture, TexCoords);
        vec2 newUV2 = vec2(TexCoords.x + noiseColor.x / texSize.x / 10, TexCoords.y + noiseColor.y / texSize.y / 10);
        vec4 fColor = texture(screenTexture, newUV2);
    
        color = quant(fColor, 255./pow(2., uQuantLevel));
//    vec4 color = vec4(1., 1., .5, 1.);
    
    
    
    
    
    
    
    
    /*
     
     perlin mess color
     
     */
    //    vec2 p = TexCoords.xy;
    //
    //    vec2 uv = p * vec2(iResolution.x/iResolution.y,1.0);
    //
    //    float f = 0.0;
    //
    //
    //    f = perlin_noise( 16.0 * uv);
    //
    //
    //    f = 0.5 + 0.5*f;
    //
    //    // 分割线：注意如果第三个参数超过了限定范围就不进行插值
    //    f *= smoothstep(0.0, 0.005, abs(p.x-0.2));
    //    f *= smoothstep(0.0, 0.005, abs(p.x-0.4));
    //    f *= smoothstep(0.0, 0.005, abs(p.x-0.6));
    //    f *= smoothstep(0.0, 0.005, abs(p.x-0.8));
    
    //    color = vec4( f, f, f, 1.0 );
    
    // the original texture
    //    color = texture( screenTexture, TexCoords);
    //        + vec2(f) / 80
    
    
    
    
    
    
    
    /*
     
     kuwahara filter
     
     Kuwahara 是一种降噪低通滤波器，能够较好的保留物体的边缘。
     基本思想就是 将Kuwahara 的模板以目标像素为中心分成4块邻域，然后分别计算四块邻域的方差，取方差最小的邻域计算其平均值，得到的结果作为目标像素的新值。
     
     */
    //    vec2 offsets[9] = vec2[](
    //                             vec2(-offset, offset),  // top-left
    //                             vec2(0.0f,    offset),  // top-center
    //                             vec2(offset,  offset),  // top-right
    //                             vec2(-offset, 0.0f),    // center-left
    //                             vec2(0.0f,    0.0f),    // center-center
    //                             vec2(offset,  0.0f),    // center-right
    //                             vec2(-offset, -offset), // bottom-left
    //                             vec2(0.0f,    -offset), // bottom-center
    //                             vec2(offset,  -offset)  // bottom-right
    //                             );
    //
    //    float kernel[9] = float[](
    //                              1, 1, 1,
    //                              1, 1, 1,
    //                              1, 1, 1
    //                              );
    //
    //
    //    for(int i = 0; i < 9; i++)
    //    {
    //        sampleGray[i] = pack(texture(screenTexture, TexCoords.st + offsets[i]).rgb);
    //    }
    //
    //
    //    preSamGary();
    //
    //    f_rel[0] = calVari(0,1,3,4);
    //    f_rel[1] = calVari(1,2,4,5);
    //    f_rel[2] = calVari(3,4,6,7);
    //    f_rel[3] = calVari(4,5,7,8);
    //
    //    int q = 0;
    //
    //    float even;
    //
    //    if ( q == 0) {
    //
    //        even = calEven(0,1,3,4);
    //
    //    } else if ( q == 1) {
    //
    //        even = calEven(1,2,4,5);
    //
    //    } else if ( q == 2) {
    //
    //        even = calEven(3,4,6,7);
    //
    //    } else if ( q == 3) {
    //
    //        even = calEven(4,5,7,8);
    //
    //    }
    //
    //    color = vec4(unpack(even),1.0);
    
    
    
    
    
    
    
    //diffusion
    
    
    
    //    //noise
    //        vec4 noiseColor = uWaterPower * texture(noiseTexture, vUV);
    //        vec2 newUV = vec2(vUV.x + noiseColor.x / texSize.x, vUV.y + noiseColor.y / texSize.y);
    //        vec4 fColor = texture(screenTexture, TexCoords + newUV/1000);
    //        vec4 dif_color =  quant(fColor, 255./pow(2., uQuantLevel));
    //
    //        color = dif_color;
    
    
    
    
    //    //filter gauss
    //                vec2 fil_pos_delta[9] = vec2[](
    //                                                  vec2(-1., -1.), vec2(0., -1.),
    //                                                  vec2(1., -1.), vec2(-1., 0.),
    //                                                  vec2(0., 0.), vec2(1., 0.),
    //                                                  vec2(-1., 1.), vec2(0., 1.), vec2(1., 1.));
    //
    //                mat3 fil = mat3(1./16., 1./8.,1./16.,
    //                                   1./8.,1./4.,1./8.,
    //                                   1./16.,1./8.,1./16.);
    //
    //                vec2 xy = vec2(vUV.x * texSize.x, vUV.y * texSize.y);
    //
    //                vec4 fil_color = dip_fil(fil, fil_pos_delta,
    //                                        screenTexture, xy, texSize);
    //
    //                color = fil_color;
    
    
    
    
    
    
    
    //blur
    //    vec4 sample0,sample1,sample2,sample3,sample4,sample5,sample6,sample7,sample8;
    //
    //    //the trick is fstep
    //    //set proper value could lead to good effection
    //    float fstep = 0.001;
    //    sample0 = texture(screenTexture,TexCoords+ vec2(-fstep,-fstep));
    //    sample1 = texture(screenTexture,TexCoords+ vec2(+fstep,-fstep));
    //    sample2 = texture(screenTexture,TexCoords+ vec2(+fstep,+fstep));
    //    sample3 = texture(screenTexture,TexCoords+ vec2(-fstep,+fstep));
    //    sample4 = texture(screenTexture,TexCoords+ vec2(-fstep,0));
    //    sample5 = texture(screenTexture,TexCoords+ vec2(+fstep,0));
    //    sample6 = texture(screenTexture,TexCoords+ vec2(0,-fstep));
    //    sample7 = texture(screenTexture,TexCoords+ vec2(0,+fstep));
    //    sample8 = texture(screenTexture,TexCoords+ vec2(0,0));
    //
    //    vec4 eql_color = (sample0+sample1+sample2+sample3+sample4+sample5+sample6+sample7+sample8) / 9.0;
    //
    //    color = eql_color;
    
    
    
    
    
    // the kernel texture
    //                    vec2 offsets[9] = vec2[](
    //                                             vec2(-offset, offset),  // top-left
    //                                             vec2(0.0f,    offset),  // top-center
    //                                             vec2(offset,  offset),  // top-right
    //                                             vec2(-offset, 0.0f),    // center-left
    //                                             vec2(0.0f,    0.0f),    // center-center
    //                                             vec2(offset,  0.0f),    // center-right
    //                                             vec2(-offset, -offset), // bottom-left
    //                                             vec2(0.0f,    -offset), // bottom-center
    //                                             vec2(offset,  -offset)  // bottom-right
    //                                             );
    //
    //                    float kernel[9] = float[](
    //                                              1, 1, 1,
    //                                              1, 8, 1,
    //                                              1, 1, 1
    ////                                              1./16., 1./8.,1./16.,
    ////                                              1./8.,1./4.,1./8.,
    ////                                              1./16.,1./8.,1./16.
    //                                              );
    //
    //                    vec4 sampleTex[9];
    //                    for(int i = 0; i < 9; i++)
    //                    {
    //                        sampleTex[i] = texture(screenTexture, TexCoords.st + offsets[i]);
    //                    }
    //
    //                    vec3 col = vec3(0.0);
    //                    for(int i = 0; i < 9; i++)
    //                        col += vec3(sampleTex[i]) * kernel[i];
    //                    col = col/12;
    //                    vec4 ker_color = vec4(col, 1.0);
    //
    //                    color = ker_color;
    
    
    
    
    //median fil
    //    vec2 ooRes = vec2(1.) / iResolution.xy;
    //    //SORT_SIZE个列
    //    for (int j=0; j<SORT_SIZE; j++)
    //    {
    //        //SORT_SIZE个行
    //        for (int i=0; i<SORT_SIZE; i++)
    //        {
    //            vec2 uv = (gl_FragCoord.xy + vec2(i,j)-vec2(SORT_SIZE/2)) * ooRes;
    //            float c = pack( texture(screenTexture,uv).rgb );
    //
    //            sort[i] = c;
    //        }
    //        // 针对某列进行纵向排序
    //        bubble_sort( SORT_SIZE);
    //
    //        //保存该列的中值
    //        float m = sort[(SORT_SIZE/2)];
    //
    //        medians[j] = m;
    //    }
    //
    //    for (int i=0; i<SORT_SIZE; i++)
    //    {
    //        sort[i] = medians[i];
    //    }
    //    //对上一步 SORT_SIZE个列中值 进行横向排序
    //    bubble_sort( SORT_SIZE);
    //    // 提取中值
    //    color = vec4(unpack(sort[SORT_SIZE/2]),1.0);
    
    
    
    
    
    //    color = (vec4(col, 1.0) + vec4(unpack(sort[SORT_SIZE/2]),1.0))/2;
    
    
    
    
    
    
    
    
    //                        float blurSizeH = 1.0 / 5000.0;
    //                        float blurSizeV = 1.0 / 5000.0;
    //                        vec4 sum = vec4(0.0);
    //                        for (int x = -4; x <= 4; x++)
    //                            for (int y = -4; y <= 4; y++)
    //                                sum += texture(
    //                                               screenTexture,
    //                                               vec2(TexCoords.x + x * blurSizeH, TexCoords.y + y * blurSizeV)
    //                                               ) / 81.0;
    //                        color = sum;
    
    
    
    
    
    /*
     
     another equal
     
     */
    
    float m;
    vec2 ooRes = vec2(1.) / iResolution.xy;
    //SORT_SIZE个列
    for (int j=0; j<SORT_SIZE; j++)
    {
        m = 0;
        //SORT_SIZE个行
        for (int i=0; i<SORT_SIZE; i++)
        {
            vec2 uv = (gl_FragCoord.xy + vec2(i,j)-vec2(SORT_SIZE/2)) * ooRes;
            float c = pack( texture(screenTexture,uv).rgb );
            
            sort[i] = c;
            m += c;
        }
        //求和
        
        medians[j] = m / SORT_SIZE;
    }
    
    
    float mm = 0;
    
    for (int i=0; i<SORT_SIZE; i++)
    {
        mm += medians[i];
    }
    
    mm = mm / SORT_SIZE;
    
    // 提取中值
    //            color = vec4(unpack(mm),1.0);
    
    
    
}