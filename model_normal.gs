#version 330 core
layout (triangles_adjacency) in;
//layout (line_strip, max_vertices = 2) out;
layout (triangle_strip, max_vertices = 4) out;


in VS_OUT {
    vec3 position;
    vec3 normal;
    vec3 FragPos;
    vec4 fragPosLightSpace;
    vec2 TexCoord;
} gs_in[];


out VS_OUT {
    vec3 position;
    vec3 normal;
    vec3 FragPos;
    vec4 fragPosLightSpace;
    vec2 TexCoord;
} vs_out;

out float gDist;
out vec2 gSpine;
out vec2 TexCoords;

uniform mat4 view;
uniform sampler2D shadowMap;

const float MAGNITUDE = 0.01f;


void GenerateTri(int a, int b, int c)
{
    gl_Position = gl_in[a].gl_Position;
    EmitVertex();
    gl_Position = gl_in[b].gl_Position;
    EmitVertex();
    gl_Position = gl_in[c].gl_Position;
    EmitVertex();
    EndPrimitive();
}

void GenerateLine(int a, int b)
{
    gl_Position = gl_in[a].gl_Position;
    EmitVertex();
    gl_Position = gl_in[b].gl_Position;
    EmitVertex();
    EndPrimitive();
}



void GenerateLine2(int a, int b)
{
    
    //    // 执行透视除法
    //    vec3 projCoords = gs_in[0].fragPosLightSpace.xyz / gs_in[0].fragPosLightSpace.w;
    //    // 变换到[0,1]的范围
    //    projCoords = projCoords * 0.5 + 0.5;
    //    // 取得最近点的深度(使用[0,1]范围下的fragPosLight当坐标)
    //    float closestDepth = texture(shadowMap, projCoords.xy).r;
    //    // 取得当前片元在光源视角下的深度
    //    float currentDepth = projCoords.z;
    
    float HalfWidth = 0.005;
    float OverhangLength = 0.08;
    
    vec2 P0 = gl_in[a].gl_Position.xy;
    vec2 P1 = gl_in[b].gl_Position.xy;
    
    vec2 E = OverhangLength * (P1 - P0);
    vec2 V = normalize(P1 - P0);
    vec2 N = vec2(-V.y, V.x) * HalfWidth;
    
    // a点的法向量 * 宽度(固定) * a点y方向(为了让宽度不一样,随着纹理的方向改变,结尾变细,用其－0.5的绝对值来表示头尾都细)
    
//    abs( normalize(vec2(gs_in[a].position.xy)).y - 0.8);
    vec2 Na =  normalize(vec2(gs_in[a].normal.x,gs_in[a].normal.y)) * HalfWidth
//    * abs( normalize(vec2(gs_in[a].position.xy)).y + 0.);
    * normalize(vec2(gs_in[a].position.xy)).y;
    vec2 Nb =  normalize(vec2(gs_in[b].normal.x,gs_in[b].normal.y)) * HalfWidth
//    * abs( normalize(vec2(gs_in[b].position.xy)).y + 0.);
    * normalize(vec2(gs_in[b].position.xy)).y;
    //    * normalize(vec2(gs_in[b].position.xy)).x
    
    gSpine = (P0 + 1.0) * 0.5;
    gDist = +HalfWidth;
    gl_Position = gl_in[a].gl_Position + vec4(- Na , 0, 0);

    
        TexCoords = vec2(0.0f, 0.0f);
//    TexCoords = vec2(gs_in[a].position.xy) + vec2(- Na);
    EmitVertex();
    
    gDist = -HalfWidth;
    gl_Position = gl_in[a].gl_Position + vec4(+ Na , 0, 0);
    
        TexCoords = vec2(0.0f, 1.0f);
//    TexCoords = vec2(gs_in[a].position.xy) + vec2(+ Na);
    EmitVertex();
    
    
    gSpine = (P1 + 1.0) * 0.5;
    gDist = +HalfWidth;
    gl_Position = gl_in[b].gl_Position + vec4(- Nb , 0, 0);
    
        TexCoords = vec2(1.0f, 0.0f);
//    TexCoords = vec2(gs_in[b].position.xy) + vec2(+ Nb);
    EmitVertex();
    
    
    gDist = -HalfWidth;
    gl_Position = gl_in[b].gl_Position + vec4(+ Nb , 0, 0);
    
        TexCoords = vec2(1.0f, 1.0f);
//    TexCoords = vec2(gs_in[b].position.xy) + vec2(+ Nb);
    EmitVertex();
    EndPrimitive();
    
}



void GenerateOut(int a)
{
    gl_Position = gl_in[a].gl_Position;
    EmitVertex();
    gl_Position = gl_in[a].gl_Position + vec4(gs_in[a].normal, 0.0f) * MAGNITUDE;
    EmitVertex();
    EndPrimitive();
}


vec3 GetNormal()//102
{
    vec3 a = vec3(gl_in[0].gl_Position) - vec3(gl_in[1].gl_Position);
    vec3 b = vec3(gl_in[2].gl_Position) - vec3(gl_in[1].gl_Position);
    return normalize(cross(a, b));
}


vec3 GetNormalHere(int aa, int bb, int cc)//312
{
    vec3 a = vec3(gl_in[aa].gl_Position) - vec3(gl_in[cc].gl_Position);
    vec3 b = vec3(gl_in[bb].gl_Position) - vec3(gl_in[cc].gl_Position);
    return normalize(cross(a, b));
}

void main()
{
    
    vs_out.position = gs_in[0].position;
    vs_out.normal = gs_in[0].normal;
    vs_out.FragPos = gs_in[0].FragPos;
    vs_out.fragPosLightSpace = gs_in[0].fragPosLightSpace;
    vs_out.TexCoord = gs_in[0].TexCoord;
    TexCoords = gs_in[0].TexCoord;
    //        GenerateLine(1,0);
    
    //    GenerateTri(2,0,4); // First vertex normal
    
    //    //现在唯一有那么一点用可以画出轮廓线的方法。。。可是并不好啊
    //        vec3 normal1 = GetNormalHere(1,2,0);
    //        vec3 viewf = normalize(vec3(viewp));
    //        if(dot(normal1, viewf)  < 0.02 && dot(normal1, viewf)  > -0.02)
    //        {
    //    //        GenerateTri(1,2,0);
    //            GenerateLine(1,0);
    //            GenerateLine(1,2);
    //        }
    
    
    
    
    ////////////////////////////////////
    //        vec3 normal1 = GetNormalHere(4,2,0);
    //        vec3 normal2 = GetNormalHere(2,1,0);
    //        vec3 normal3 = GetNormalHere(4,3,2);
    //        vec3 normal4 = GetNormalHere(0,5,4);
    //        vec3 viewf = normalize(vec3(viewp));
    //
    //        if(dot(normal1, viewf) * dot(normal2, viewf) < 0)
    //        {
    //            GenerateLine(0,2);
    //        }
    //        if(dot(normal1, viewf) * dot(normal3, viewf) < 0)
    //        {
    //            GenerateLine(2,4);
    //        }
    //        if(dot(normal1, viewf) * dot(normal4, viewf) < 0)
    //        {
    //            GenerateLine(4,0);
    //        }
    
    
    
    vec3 V0 = gl_in[0].gl_Position.xyz;
    vec3 V1 = gl_in[1].gl_Position.xyz;
    vec3 V2 = gl_in[2].gl_Position.xyz;
    vec3 V3 = gl_in[3].gl_Position.xyz;
    vec3 V4 = gl_in[4].gl_Position.xyz;
    vec3 V5 = gl_in[5].gl_Position.xyz;
    vec3 N042 = cross( V4-V0, V2-V0 );
    vec3 N021 = cross( V2-V0, V1-V0 );
    vec3 N243 = cross( V4-V2, V3-V2 );
    vec3 N405 = cross( V0-V4, V5-V4 );
    
    
    //make the self edge dissappear
    //    if( dot( N042, N021 ) < 0. )
    //        N021 = vec3(0.,0.,0.) - N021;
    //    if( dot( N042, N243 ) < 0. )
    //        N243 = vec3(0.,0.,0.) - N243;
    //    if( dot( N042, N405 ) < 0. )
    //        N405 = vec3(0.,0.,0.) - N405;
    
    
    //z just like the self view point
//            if( N042.z * N021.z < 0. )
//            {
//                GenerateLine(0,2);
//            }
//            if( N042.z * N243.z < 0. )
//            {
//                GenerateLine(2,4);
//            }
//            if( N042.z * N405.z < 0. )
//            {
//                GenerateLine(4,0);
//            }
    
    
    //width one
    if( N042.z * N021.z < 0.00 )
    {
        GenerateLine2(0,2);
    }
    if( N042.z * N243.z < 0.00 )
    {
        GenerateLine2(2,4);
    }
    if( N042.z * N405.z < 0.00 )
    {
        GenerateLine2(4,0);
    }
    
    
}
