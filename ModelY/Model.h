//
//  Model.h
//  ModelTest
//
//  Created by Sky on 5/4/16.
//  Copyright (c) 2016 Sky. All rights reserved.
//
// n b n b
//

#ifndef ModelTest_Model_h
#define ModelTest_Model_h

#define ARRAY_SIZE_IN_ELEMENTS(a) (sizeof(a)/sizeof(a[0]))

#pragma once
// Std. Includes
#include <string>
#include <fstream>
#include <sstream>
#include <iostream>
#include <map>
#include <vector>
using namespace std;
// GL Includes
#include <GL/glew.h> // Contains all the necessery OpenGL includes
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <SOIL.h>
#include <assimp/Importer.hpp>
#include <assimp/scene.h>
#include <assimp/postprocess.h>

#include "Mesh.h"

GLint TextureFromFile(const char* path, string directory);
void FindAdjacencies(const aiMesh* mesh, vector<GLuint>& Indices);




struct Edge
{
    Edge(uint _a, uint _b)
    {
        //        assert(_a != _b);
        
        if (_a < _b)
        {
            a = _a;
            b = _b;
        }
        else
        {
            a = _b;
            b = _a;
        }
    }
    
    void Print()
    {
        printf("Edge %d %d\n", a, b);
    }
    
    uint a;
    uint b;
};

struct Neighbors
{
    uint n1;
    uint n2;
    
    Neighbors()
    {
        n1 = n2 = (uint)-1;
    }
    
    void AddNeigbor(uint n)
    {
        if (n1 == -1) {
            n1 = n;
        }
        else if (n2 == -1) {
            n2 = n;
        }
        else {
            //            assert(0);
        }
    }
    
    uint GetOther(uint me) const
    {
        if (n1 == me) {
            return n2;
        }
        else if (n2 == me) {
            return n1;
        }
        else {
            //            assert(0);
        }
        
        return 0;
    }
};

struct CompareEdges
{
    bool operator()(const Edge& Edge1, const Edge& Edge2) const
    {
        if (Edge1.a < Edge2.a) {
            return true;
        }
        else if (Edge1.a == Edge2.a) {
            return (Edge1.b < Edge2.b);
        }
        else {
            return false;
        }
    }
};


struct CompareVectors
{
    bool operator()(const aiVector3D& a, const aiVector3D& b) const
    {
        if (a.x < b.x) {
            return true;
        }
        else if (a.x == b.x) {
            if (a.y < b.y) {
                return true;
            }
            else if (a.y == b.y) {
                if (a.z < b.z) {
                    return true;
                }
            }
        }
        
        return false;
    }
};


struct Face
{
    uint Indices[3];
    
    uint GetOppositeIndex(const Edge& e) const
    {
        for (uint i = 0 ; i < ARRAY_SIZE_IN_ELEMENTS(Indices) ; i++)
        {
            uint Index = Indices[i];
            if (Index != e.a && Index != e.b) {
                return Index;
            }
        }
        
        //        assert(0);
        
        return 0;
    }
};





class Model
{
public:
    
    
    
    
    std::map<Edge, Neighbors, CompareEdges> m_indexMap;
    std::map<aiVector3D, uint, CompareVectors> m_posMap;
    std::vector<Face> m_uniqueFaces;
    
    
    
    
    /*  Functions   */
    // Constructor, expects a filepath to a 3D model.
    Model(GLchar* path)
    {
        this->loadModel(path);
    }
    
    // Draws the model, and thus all its meshes
    void Draw(Shader shader)
    {
        for(GLuint i = 0; i < this->meshes.size(); i++)
            this->meshes[i].Draw(shader);
    }
    
    
    
private:
    /*  Model Data  */
    vector<Mesh> meshes;
    string directory;
    vector<Texture> textures_loaded;	// Stores all the textures loaded so far, optimization to make sure textures aren't loaded more than once.
    
    /*  Functions   */
    // Loads a model with supported ASSIMP extensions from file and stores the resulting meshes in the meshes vector.
    void loadModel(string path)
    {
        // Read file via ASSIMP
        Assimp::Importer importer;
        const aiScene* scene = importer.ReadFile(path, aiProcess_Triangulate | aiProcess_FlipUVs| aiProcess_GenNormals);
        // Check for errors
        if(!scene || scene->mFlags == AI_SCENE_FLAGS_INCOMPLETE || !scene->mRootNode) // if is Not Zero
        {
            cout << "ERROR::ASSIMP:: " << importer.GetErrorString() << endl;
            return;
        }
        // Retrieve the directory path of the filepath
        this->directory = path.substr(0, path.find_last_of('/'));
        
        // Process ASSIMP's root node recursively
        this->processNode(scene->mRootNode, scene);
    }
    
    // Processes a node in a recursive fashion. Processes each individual mesh located at the node and repeats this process on its children nodes (if any).
    void processNode(aiNode* node, const aiScene* scene)
    {
        // Process each mesh located at the current node
        for(GLuint i = 0; i < node->mNumMeshes; i++)
        {
            // The node object only contains indices to index the actual objects in the scene.
            // The scene contains all the data, node is just to keep stuff organized (like relations between nodes).
            aiMesh* mesh = scene->mMeshes[node->mMeshes[i]];
            this->meshes.push_back(this->processMesh(mesh, scene));
        }
        // After we've processed all of the meshes (if any) we then recursively process each of the children nodes
        for(GLuint i = 0; i < node->mNumChildren; i++)
        {
            this->processNode(node->mChildren[i], scene);
        }
        
    }
    
    Mesh processMesh(aiMesh* mesh, const aiScene* scene)
    {
        // Data to fill
        vector<Vertex> vertices;
        vector<GLuint> indices;
        vector<Texture> textures;
        
        
        
        
        
        // Walk through each of the mesh's vertices
        for(GLuint i = 0; i < mesh->mNumVertices; i++)
        {
            Vertex vertex;
            glm::vec3 vector; // We declare a placeholder vector since assimp uses its own vector class that doesn't directly convert to glm's vec3 class so we transfer the data to this placeholder glm::vec3 first.
            // Positions
            vector.x = mesh->mVertices[i].x;
            vector.y = mesh->mVertices[i].y;
            vector.z = mesh->mVertices[i].z;
            vertex.Position = vector;
            // Normals
            vector.x = mesh->mNormals[i].x;
            vector.y = mesh->mNormals[i].y;
            vector.z = mesh->mNormals[i].z;
            vertex.Normal = vector;
            // Texture Coordinates
            if(mesh->mTextureCoords[0]) // Does the mesh contain texture coordinates?
            {
                glm::vec2 vec;
                // A vertex can contain up to 8 different texture coordinates. We thus make the assumption that we won't
                // use models where a vertex can have multiple texture coordinates so we always take the first set (0).
                vec.x = mesh->mTextureCoords[0][i].x;
                vec.y = mesh->mTextureCoords[0][i].y;
                vertex.TexCoords = vec;
            }
            else
                vertex.TexCoords = glm::vec2(0.0f, 0.0f);
            vertices.push_back(vertex);
        }
        
        
        
        
        
        // Now wak through each of the mesh's faces (a face is a mesh its triangle) and retrieve the corresponding vertex indices.
        //        for(GLuint i = 0; i < mesh->mNumFaces; i++)
        //        {
        //            aiFace face = mesh->mFaces[i];
        
        //In every single triangle
        //            for (uint j = 0 ; j < 3 ; j++) {
        //
        //                //get to verticles first to represent edge
        //                uint Index1 = face.mIndices[j];
        //                aiVector3D& v1 = mesh->mVertices[Index1];
        //                uint Index2 = face.mIndices[(j + 1) % 3];
        //                aiVector3D& v2 = mesh->mVertices[Index2];
        //
        //                //search every triangle to find the one
        //                for(GLuint q = 0; q < mesh->mNumFaces; q++)
        //                {
        //                    if(q != i)
        //                    {
        //                        aiFace& facecom = mesh->mFaces[q];
        //
        //
        //                        uint Indexa = face.mIndices[0];
        //                        aiVector3D& va = mesh->mVertices[Indexa];
        //                        uint Indexb = face.mIndices[1];
        //                        aiVector3D& vb = mesh->mVertices[Indexb];
        //                        uint Indexc = face.mIndices[2];
        //                        aiVector3D& vc = mesh->mVertices[Indexc];
        //
        //
        //                        //compare six times
        //                        if((va == v1 && vb == v2) || (va == v2 && vb == v1))
        //                        {
        //                            indices.push_back(face.mIndices[Index1]);
        //                            indices.push_back(face.mIndices[Indexc]);
        //                        }
        //                        else if((vc == v1 && vb == v2) || (vb == v2 && vc == v1))
        //                        {
        //                            indices.push_back(face.mIndices[Index1]);
        //                            indices.push_back(face.mIndices[Indexa]);
        //                        }
        //                        else
        //                        {
        //                            indices.push_back(face.mIndices[Index1]);
        //                            indices.push_back(face.mIndices[Indexb]);
        //                        }
        //
        //
        //                    }
        //                }
        //            }
        
        
        
        
        // Retrieve all indices of the face and store them in the indices vector
        //            for(GLuint j = 0; j < face.mNumIndices; j++)
        //            {
        //                indices.push_back(face.mIndices[j]);
        //                indices.push_back(face.mIndices[j]);
        //            }
        //        }
        
        
        
        
        
        
        
        
        
        
        ///Sort for adjacency
        
        //        FindAdjacencies(mesh, indices);
        
        // Step 1 - find the two triangles that share every edge
        for (uint i = 0 ; i < mesh->mNumFaces ; i++) {
            const aiFace& face = mesh->mFaces[i];
            
            Face Unique;
            
            // If a position vector is duplicated in the VB we fetch the
            // index of the first occurrence.
            for (uint j = 0 ; j < 3 ; j++) {
                uint Index = face.mIndices[j];
                aiVector3D& v = mesh->mVertices[Index];
                
                if (m_posMap.find(v) == m_posMap.end()) {
                    m_posMap[v] = Index;
                }
                else {
                    Index = m_posMap[v];
                }
                
                Unique.Indices[j] = Index;
            }
            
            m_uniqueFaces.push_back(Unique);
            
            Edge e1(Unique.Indices[0], Unique.Indices[1]);
            Edge e2(Unique.Indices[1], Unique.Indices[2]);
            Edge e3(Unique.Indices[2], Unique.Indices[0]);
            
            m_indexMap[e1].AddNeigbor(i);
            m_indexMap[e2].AddNeigbor(i);
            m_indexMap[e3].AddNeigbor(i);
        }
        
        // Step 2 - build the index buffer with the adjacency info
        for (uint i = 0 ; i < mesh->mNumFaces ; i++) {
            const Face& face = m_uniqueFaces[i];
            
            for (uint j = 0 ; j < 3 ; j++) {
                Edge e(face.Indices[j], face.Indices[(j + 1) % 3]);
                assert(m_indexMap.find(e) != m_indexMap.end());
                Neighbors n = m_indexMap[e];
                uint OtherTri = n.GetOther(i);
                
                if(OtherTri != -1){
                    
                    const Face& OtherFace = m_uniqueFaces[OtherTri];
                    uint OppositeIndex = OtherFace.GetOppositeIndex(e);
                    
                    indices.push_back(face.Indices[j]);
                    indices.push_back(OppositeIndex);
                }
                else{
                    //???no edges ???
                    indices.push_back(face.Indices[j]);
                    indices.push_back(face.Indices[j]);
                }
            }
        }
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        // Process materials
        if(mesh->mMaterialIndex >= 0)
        {
            aiMaterial* material = scene->mMaterials[mesh->mMaterialIndex];
            // We assume a convention for sampler names in the shaders. Each diffuse texture should be named
            // as 'texture_diffuseN' where N is a sequential number ranging from 1 to MAX_SAMPLER_NUMBER.
            // Same applies to other texture as the following list summarizes:
            // Diffuse: texture_diffuseN
            // Specular: texture_specularN
            // Normal: texture_normalN
            
            // 1. Diffuse maps
            vector<Texture> diffuseMaps = this->loadMaterialTextures(material, aiTextureType_DIFFUSE, "texture_diffuse");
            textures.insert(textures.end(), diffuseMaps.begin(), diffuseMaps.end());
            // 2. Specular maps
            vector<Texture> specularMaps = this->loadMaterialTextures(material, aiTextureType_SPECULAR, "texture_specular");
            textures.insert(textures.end(), specularMaps.begin(), specularMaps.end());
        }
        
        // Return a mesh object created from the extracted mesh data
        return Mesh(vertices, indices, textures);
    }
    
    // Checks all material textures of a given type and loads the textures if they're not loaded yet.
    // The required info is returned as a Texture struct.
    vector<Texture> loadMaterialTextures(aiMaterial* mat, aiTextureType type, string typeName)
    {
        vector<Texture> textures;
        for(GLuint i = 0; i < mat->GetTextureCount(type); i++)
        {
            aiString str;
            mat->GetTexture(type, i, &str);
            // Check if texture was loaded before and if so, continue to next iteration: skip loading a new texture
            GLboolean skip = false;
            for(GLuint j = 0; j < textures_loaded.size(); j++)
            {
                if(textures_loaded[j].path == str)
                {
                    textures.push_back(textures_loaded[j]);
                    skip = true; // A texture with the same filepath has already been loaded, continue to next one. (optimization)
                    break;
                }
            }
            if(!skip)
            {   // If texture hasn't been loaded already, load it
                Texture texture;
                texture.id = TextureFromFile(str.C_Str(), this->directory);
                texture.type = typeName;
                texture.path = str;
                textures.push_back(texture);
                this->textures_loaded.push_back(texture);  // Store it as texture loaded for entire model, to ensure we won't unnecesery load duplicate textures.
            }
        }
        return textures;
    }
};




GLint TextureFromFile(const char* path, string directory)
{
    //Generate texture ID and load texture data
    string filename = string(path);
    filename = directory + '/' + filename;
    GLuint textureID;
    glGenTextures(1, &textureID);
    int width,height;
    unsigned char* image = SOIL_load_image(filename.c_str(), &width, &height, 0, SOIL_LOAD_RGB);
    // Assign texture to ID
    glBindTexture(GL_TEXTURE_2D, textureID);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, image);
    glGenerateMipmap(GL_TEXTURE_2D);
    
    // Parameters
    glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT );
    glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT );
    glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR );
    glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glBindTexture(GL_TEXTURE_2D, 0);
    SOIL_free_image_data(image);
    return textureID;
}


void FindAdjacencies(const aiMesh* mesh, vector<GLuint>& Indices)
{
    
}

#endif
