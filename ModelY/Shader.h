//
//  Shader.h
//  ModelX
//
//  Created by Sky on 7/18/16.
//  Copyright (c) 2016 Sky. All rights reserved.
//

#ifndef ModelX_Shader_h
#define ModelX_Shader_h

#include <stdio.h>
#include <string>
#include <fstream>
#include <sstream>
#include <iostream>

using namespace std;

#include <GL/glew.h>


struct Shader
{
    // 程序ID
    GLuint Program;
    // 构造器读取并创建Shader
    Shader(const GLchar * vertexSourcePath, const GLchar * fragmentSourcePath);
    Shader(const GLchar * vertexSourcePath, const GLchar * fragmentSourcePath, const GLchar * geometrySourcePath);
    // 使用Program
    void Use();
};


Shader::Shader(const GLchar * vertexPath, const GLchar * fragmentPath)
{
    // 1. 从文件路径获得vertex/fragment源码
    std::string vertexCode;
    std::string fragmentCode;
    // 打开文件 Open files
    std::ifstream vShaderFile(vertexPath);
    std::ifstream fShaderFile(fragmentPath);
    
    std::stringstream vShaderStream, fShaderStream;
    
    try {
        
        // 读取文件缓冲到流 Read file’s buffer contents into streams
        vShaderStream << vShaderFile.rdbuf();
        fShaderStream << fShaderFile.rdbuf();
        
        // 关闭文件句柄 close file handlers
        vShaderFile.close();
        fShaderFile.close();
        
        // 将流转为GLchar数组 Convert stream into GLchar array
        vertexCode = vShaderStream.str();
        fragmentCode = fShaderStream.str();
    }
    catch(std::exception e)
    {
        std::cout << "ERROR::SHADER::FILE_NOT_SUCCESFULLY_READ" << std::endl;
    }
    
    const GLchar* vShaderCode = vertexCode.c_str();
    const GLchar * fShaderCode = fragmentCode.c_str();
    
    // 2. 编译着色器
    GLuint vertex, fragment;
    GLint success;
    GLchar infoLog[512];
    
    // 顶点着色器
    vertex = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertex, 1, &vShaderCode, NULL);
    glCompileShader(vertex);
    
    // 打印编译时错误
    glGetShaderiv(vertex, GL_COMPILE_STATUS, &success);
    if(!success)
    {
        glGetShaderInfoLog(vertex, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::VERTEX::COMPILATION_FAILED\n" << vertexPath << infoLog << std::endl;
    };
    
    
    
    // 对像素着色器进行类似处理
    // Fragment Shader
    fragment = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragment, 1, &fShaderCode, NULL);
    glCompileShader(fragment);
    // Print compile errors if any
    glGetShaderiv(fragment, GL_COMPILE_STATUS, &success);
    if (!success)
    {
        glGetShaderInfoLog(fragment, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::FRAGMENT::COMPILATION_FAILED\n" << fragmentPath <<infoLog << std::endl;
    }
    
    
    
    // 着色器程序
    this->Program = glCreateProgram();
    glAttachShader(this->Program, vertex);
    glAttachShader(this->Program, fragment);
    glLinkProgram(this->Program);
    
    // 打印连接错误
    glGetProgramiv(this->Program, GL_LINK_STATUS, &success);
    if(!success)
    {
        glGetProgramInfoLog(this->Program, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::PROGRAM::LINKING_FAILED\n" << infoLog << std::endl;
    }
    
    // 删除着色器
    glDeleteShader(vertex);
    glDeleteShader(fragment);
}

Shader::Shader(const GLchar * vertexPath, const GLchar * fragmentPath, const GLchar * geometryPath)
{
    // 1. 从文件路径获得vertex/fragment源码
    std::string vertexCode;
    std::string fragmentCode;
    std::string geometryCode;
    // 打开文件 Open files
    std::ifstream vShaderFile(vertexPath);
    std::ifstream fShaderFile(fragmentPath);
    std::ifstream gShaderFile(geometryPath);
    
    std::stringstream vShaderStream, fShaderStream, gShaderStream;
    
    try {
        
        // 读取文件缓冲到流 Read file’s buffer contents into streams
        vShaderStream << vShaderFile.rdbuf();
        fShaderStream << fShaderFile.rdbuf();
        gShaderStream << gShaderFile.rdbuf();
        
        // 关闭文件句柄 close file handlers
        vShaderFile.close();
        fShaderFile.close();
        gShaderFile.close();
        
        // 将流转为GLchar数组 Convert stream into GLchar array
        vertexCode = vShaderStream.str();
        fragmentCode = fShaderStream.str();
        geometryCode = gShaderStream.str();
    }
    catch(std::exception e)
    {
        std::cout << "ERROR::SHADER::FILE_NOT_SUCCESFULLY_READ" << std::endl;
    }
    
    const GLchar* vShaderCode = vertexCode.c_str();
    const GLchar * fShaderCode = fragmentCode.c_str();
    const GLchar * gShaderCode = geometryCode.c_str();
    
    // 2. 编译着色器
    GLuint vertex, fragment, geometry;
    GLint success;
    GLchar infoLog[512];
    
    // 顶点着色器
    vertex = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertex, 1, &vShaderCode, NULL);
    glCompileShader(vertex);
    
    
    // 打印编译时错误
    glGetShaderiv(vertex, GL_COMPILE_STATUS, &success);
    if(!success)
    {
        glGetShaderInfoLog(vertex, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::VERTEX::COMPILATION_FAILED\n" << infoLog << std::endl;
    };
    
    
    
    // 对像素着色器进行类似处理
    // Fragment Shader
    fragment = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragment, 1, &fShaderCode, NULL);
    glCompileShader(fragment);
    // Print compile errors if any
    glGetShaderiv(fragment, GL_COMPILE_STATUS, &success);
    if (!success)
    {
        glGetShaderInfoLog(fragment, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::FRAGMENT::COMPILATION_FAILED\n" << infoLog << std::endl;
    }
    
    
    
    //GEOMETRY SHADER
    geometry = glCreateShader(GL_GEOMETRY_SHADER);
    glShaderSource(geometry, 1, &gShaderCode, NULL);
    glCompileShader(geometry);
    
    glGetShaderiv(geometry, GL_COMPILE_STATUS, &success);
    if (!success)
    {
        glGetShaderInfoLog(geometry, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::FRAGMENT::COMPILATION_FAILED\n" << infoLog << std::endl;
    }
    
    
    
    
    // 着色器程序
    this->Program = glCreateProgram();
    glAttachShader(this->Program, vertex);
    glAttachShader(this->Program, fragment);
    glAttachShader(this->Program, geometry);
    glLinkProgram(this->Program);
    
    
    
    // 打印连接错误
    glGetProgramiv(this->Program, GL_LINK_STATUS, &success);
    if(!success)
    {
        glGetProgramInfoLog(this->Program, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::PROGRAM::LINKING_FAILED\n" << infoLog << std::endl;
    }
    
    // 删除着色器
    glDeleteShader(vertex);
    glDeleteShader(fragment);
    glDeleteShader(geometry);
}


void Shader::Use()
{
    glUseProgram(this->Program);
}




#endif
