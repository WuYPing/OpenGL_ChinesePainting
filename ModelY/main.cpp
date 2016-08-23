//
//  main.cpp
//  ModelTest
//
//  Created by Sky on 5/4/16.
//  Copyright (c) 2016 Sky. All rights reserved.
//

// Std. Includes
#include <string>

// GLEW
#define GLEW_STATIC
#include <GL/glew.h>

// GLFW
#include <GLFW/glfw3.h>

// GL includes
#include "Shader.h"
#include "Camera.h"
#include "Model.h"

// GLM Mathemtics
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

// Other Libs
#include <SOIL.h>

// Properties
GLuint screenWidth = 800, screenHeight = 600;

// Function prototypes
void key_callback(GLFWwindow* window, int key, int scancode, int action, int mode);
void scroll_callback(GLFWwindow* window, double xoffset, double yoffset);
void mouse_callback(GLFWwindow* window, double xpos, double ypos);
void Do_Movement();

// Camera
Camera camera(glm::vec3(0.0f, 0.0f, 3.0f));
bool keys[1024];
GLfloat lastX = 400, lastY = 300;
bool firstMouse = true;

GLfloat deltaTime = 0.0f;
GLfloat lastFrame = 0.0f;

// The MAIN function, from here we start our application and run our Game loop
int main()
{
    // Init GLFW
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_RESIZABLE, GL_FALSE);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);// make macos happy! \(^ 3 ^ )/
    
    GLFWwindow* window = glfwCreateWindow(screenWidth, screenHeight, "LearnOpenGL", nullptr, nullptr); // Windowed
    glfwMakeContextCurrent(window);
    
    // Set the required callback functions
    glfwSetKeyCallback(window, key_callback);
    glfwSetCursorPosCallback(window, mouse_callback);
    glfwSetScrollCallback(window, scroll_callback);
    
    // Options
    glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);
    
    // Initialize GLEW to setup the OpenGL Function pointers
    glewExperimental = GL_TRUE;
    glewInit();
    
    // Define the viewport dimensions
    glViewport(0, 0, screenWidth, screenHeight);
    
    // Setup some OpenGL options
    glEnable(GL_DEPTH_TEST);
    
    glEnable(GL_LINE_SMOOTH);
    
    //    glDepthFunc(GL_LEQUAL);
    
    //Open the culling
    //        glEnable(GL_CULL_FACE);
    //        glCullFace(GL_BACK);
    //        glFrontFace(GL_CW);
    
    
    
    
    
    
    
    
    
    //SHOW SHADER
    Shader shader("/Users/apple/GitHub/OpenGL_Model_Outline/OpenGL_Model_Outline/model_loading.vs", "/Users/apple/GitHub/OpenGL_Model_Outline/OpenGL_Model_Outline/model_loading.frag","/Users/apple/GitHub/OpenGL_Model_Outline/OpenGL_Model_Outline/model_loading.gs");
    
    //NORMAL SHADER
    Shader normalShader("/Users/apple/GitHub/OpenGL_Model_Outline/OpenGL_Model_Outline/model_normal.vs", "/Users/apple/GitHub/OpenGL_Model_Outline/OpenGL_Model_Outline/model_normal.frag","/Users/apple/GitHub/OpenGL_Model_Outline/OpenGL_Model_Outline/model_normal.gs");
    
    //TRIII SHADER
    //    Shader normalShader("/Users/apple/Documents/OPENGL/ModelTest/model_line.vs", "/Users/apple/Documents/OPENGL/ModelTest/model_line.frag","/Users/apple/Documents/OPENGL/ModelTest/model_line.gs");
    
    //DEPTH SHADER
    Shader depthShader("/Users/apple/GitHub/OpenGL_Model_Outline/OpenGL_Model_Outline/shadow_mapping_depth.vs", "/Users/apple/GitHub/OpenGL_Model_Outline/OpenGL_Model_Outline/shadow_mapping_depth.frag");
    
    
    
    
    
    
    
    
    //     Load models
    //    Model ourModel("/Users/apple/Downloads/nanosuit/nanosuit.obj");
    
    //    Model ourModel("/Users/apple/Documents/maya/projects/default/scenes/PENRU.obj");
    
    //    Model ourModel("/Users/apple/Downloads/ConsoleApplication3/tails/Tails.obj");
    
    //    Model ourModel("/Users/apple/Documents/maya/projects/default/scenes/ANT.obj");
    
    //    Model ourModel("/Users/apple/Documents/maya/projects/default/scenes/CAMEL.obj");
    
    //    Model ourModel("/Users/apple/Documents/maya/projects/default/scenes/CAMEL2.obj");
    
    Model ourModel("/Users/apple/Documents/maya/projects/default/scenes/SPARROW.obj");
    
    
    
    
    
    
    
    
    
    
    
    
    
    // Set projection matrix
    glm::mat4 projection = glm::perspective(45.0f, (GLfloat)screenWidth/(GLfloat)screenHeight, 1.0f, 100.0f);
    shader.Use();
    glUniformMatrix4fv(glGetUniformLocation(shader.Program, "projection"), 1, GL_FALSE, glm::value_ptr(projection));
    // Also one for normal shader
    normalShader.Use();
    glUniformMatrix4fv(glGetUniformLocation(normalShader.Program, "projection"), 1, GL_FALSE, glm::value_ptr(projection));
    
    depthShader.Use();
    glUniformMatrix4fv(glGetUniformLocation(depthShader.Program, "projection"), 1, GL_FALSE, glm::value_ptr(projection));
    
    
    
    
    
    
    
    
    
    
    normalShader.Use();
    glUniform1i(glGetUniformLocation(normalShader.Program, "shadowMap"), 0);
    //
    //
    //    // Configure depth map FBO
    const GLuint SHADOW_WIDTH = 800*2, SHADOW_HEIGHT = 600*2;
    GLuint depthMapFBO;
    glGenFramebuffers(1, &depthMapFBO);
    // - Create depth texture
    GLuint depthMap;
    glGenTextures(1, &depthMap);
    glBindTexture(GL_TEXTURE_2D, depthMap);
    
    glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT, SHADOW_WIDTH, SHADOW_HEIGHT, 0, GL_DEPTH_COMPONENT, GL_FLOAT, NULL);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
    
    glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
    glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_TEXTURE_2D, depthMap, 0);
    glDrawBuffer(GL_NONE);
    glReadBuffer(GL_NONE);
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
    
    
    
    
    
    //    // Draw in wireframe
    //        glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);
    
    //        // Draw in point
    //            glPolygonMode(GL_FRONT_AND_BACK, GL_POINT);
    
    
    
    
    
    // Game loop
    while(!glfwWindowShouldClose(window))
    {
        // Set frame time
        GLfloat currentFrame = glfwGetTime();
        deltaTime = currentFrame - lastFrame;
        lastFrame = currentFrame;
        
        // Check and call events
        glfwPollEvents();
        Do_Movement();
        
        
        
        //For the depth buffer value
        
        // 1. Render depth of scene to texture (from ligth's perspective)
        // - Get light projection/view matrix.
        
        GLfloat near_plane = 1.0f, far_plane = 7.5f;
        
        // - now render scene from light's point of view
        depthShader.Use();
        //        glUniformMatrix4fv(glGetUniformLocation(depthShader.Program, "lightSpaceMatrix"), 1, GL_FALSE, glm::value_ptr(lightSpaceMatrix));
        
        glViewport(0, 0, SHADOW_WIDTH, SHADOW_HEIGHT);
        glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
        glClear(GL_DEPTH_BUFFER_BIT);
        
        
        
        
        glm::mat4 projection = glm::perspective(camera.Zoom, (float)screenWidth/(float)screenHeight, 0.1f, 100.0f);
        glm::mat4 view = camera.GetViewMatrix();
        
        glUniformMatrix4fv(glGetUniformLocation(depthShader.Program, "projection"), 1, GL_FALSE, glm::value_ptr(projection));
        glUniformMatrix4fv(glGetUniformLocation(depthShader.Program, "view"), 1, GL_FALSE, glm::value_ptr(view));
        
        
        
        
        
        glm::mat4 dprojection = glm::ortho(-10.0f, 10.0f, -10.0f, 10.0f, near_plane, far_plane);
        glm::mat4 lightSpaceMatrix = dprojection * view;
        
        glUniformMatrix4fv(glGetUniformLocation(depthShader.Program, "lightSpaceMatrix"), 1, GL_FALSE, glm::value_ptr(lightSpaceMatrix));
        
        
        
        
        
        
        // Draw the loaded model
        glm::mat4 model;
        model = glm::translate(model, glm::vec3(0.0f, -1.75f, 0.0f)); // Translate it down a bit so it's at the center of the scene
        model = glm::scale(model, glm::vec3(0.2f, 0.2f, 0.2f));	// It's a bit too big for our scene, so scale it down
        
        
        
        glUniformMatrix4fv(glGetUniformLocation(depthShader.Program, "model"), 1, GL_FALSE, glm::value_ptr(model));
        
        // Add time component to geometry shader in the form of a uniform
        //        glUniform1f(glGetUniformLocation(shader.Program, "time"), glfwGetTime());
        
        ourModel.Draw(depthShader);
        
        
        
        
        
        /////////////
        
        glBindFramebuffer(GL_FRAMEBUFFER, 0);
        
        
        
        
        
        
        
        
        
        
        
        // Clear the colorbuffer
        // Background Color
        glClearColor(255.0/255,252.0/255,234.0/255,1.0f);
        //        glClearColor(0.99f, 0.97f, 090.f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        
        
        
        
        ///////2222222222222
        
        //        glViewport(0, 0, SHADOW_WIDTH, SHADOW_HEIGHT);
        //        glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
        //        glClear(GL_DEPTH_BUFFER_BIT | GL_COLOR_BUFFER_BIT );
        
        // Now set transformation matrices for drawing normals
        normalShader.Use();
        glUniformMatrix4fv(glGetUniformLocation(normalShader.Program, "view"), 1, GL_FALSE, glm::value_ptr(camera.GetViewMatrix()));
        
        
        model = glm::mat4();
        model = glm::translate(model, glm::vec3(0.0f, -1.75f, 0.0f)); // Translate it down a bit so it's at the center of the scene
        model = glm::scale(model, glm::vec3(0.2f, 0.2f, 0.2f));	// It's a bit too big for our scene, so scale it down
        glUniformMatrix4fv(glGetUniformLocation(normalShader.Program, "model"), 1, GL_FALSE, glm::value_ptr(model));
        
        glUniform1f(glGetUniformLocation(normalShader.Program, "time"), glfwGetTime());
        
        glUniformMatrix4fv(glGetUniformLocation(normalShader.Program, "lightSpaceMatrix"), 1, GL_FALSE, glm::value_ptr(lightSpaceMatrix));
        
        //        glViewport(0, 0, SHADOW_WIDTH, SHADOW_HEIGHT);
        //        glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
        //        glClear(GL_DEPTH_BUFFER_BIT);
        //        RenderScene(simpleDepthShader);
        //        glBindFramebuffer(GL_FRAMEBUFFER, 0);
        
        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, depthMap);
        
        ourModel.Draw(normalShader);
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        ////3333333333333
        
        //DRAG OUT THE NORMALLLS
        
        shader.Use();   // <-- Don't forget this one!
        // Transformation matrices
        //        glm::mat4 projection = glm::perspective(camera.Zoom, (float)screenWidth/(float)screenHeight, 0.1f, 100.0f);
        //        glm::mat4 view = camera.GetViewMatrix();
        
        glUniformMatrix4fv(glGetUniformLocation(shader.Program, "projection"), 1, GL_FALSE, glm::value_ptr(projection));
        glUniformMatrix4fv(glGetUniformLocation(shader.Program, "view"), 1, GL_FALSE, glm::value_ptr(view));
        
        
        // Draw the loaded model
        //        glm::mat4 model;
        //        model = glm::translate(model, glm::vec3(0.0f, -1.75f, 0.0f)); // Translate it down a bit so it's at the center of the scene
        //        model = glm::scale(model, glm::vec3(0.2f, 0.2f, 0.2f));	// It's a bit too big for our scene, so scale it down
        
        
        model = glm::mat4();
        model = glm::translate(model, glm::vec3(0.0f, -1.75f, 0.0f)); // Translate it down a bit so it's at the center of the scene
        model = glm::scale(model, glm::vec3(0.2f, 0.2f, 0.2f));	// It's a bit too big for our scene, so scale it down
        glUniformMatrix4fv(glGetUniformLocation(shader.Program, "model"), 1, GL_FALSE, glm::value_ptr(model));
        
        // Add time component to geometry shader in the form of a uniform
        //        glUniform1f(glGetUniformLocation(shader.Program, "time"), glfwGetTime());
        
        //        ourModel.Draw(shader);
        
        
        
        
        
        
        
        
        
        
        
        
        
        // Swap the buffers
        glfwSwapBuffers(window);
    }
    
    glfwTerminate();
    return 0;
}











#pragma region "User input"

// Moves/alters the camera positions based on user input
void Do_Movement()
{
    // Camera controls
    if(keys[GLFW_KEY_W])
        camera.ProcessKeyboard(FORWARD, deltaTime);
    if(keys[GLFW_KEY_S])
        camera.ProcessKeyboard(BACKWARD, deltaTime);
    if(keys[GLFW_KEY_A])
        camera.ProcessKeyboard(LEFT, deltaTime);
    if(keys[GLFW_KEY_D])
        camera.ProcessKeyboard(RIGHT, deltaTime);
}

// Is called whenever a key is pressed/released via GLFW
void key_callback(GLFWwindow* window, int key, int scancode, int action, int mode)
{
    if(key == GLFW_KEY_ESCAPE && action == GLFW_PRESS)
        glfwSetWindowShouldClose(window, GL_TRUE);
    
    if(action == GLFW_PRESS)
        keys[key] = true;
    else if(action == GLFW_RELEASE)
        keys[key] = false;
}

void mouse_callback(GLFWwindow* window, double xpos, double ypos)
{
    if(firstMouse)
    {
        lastX = xpos;
        lastY = ypos;
        firstMouse = false;
    }
    
    GLfloat xoffset = xpos - lastX;
    GLfloat yoffset = lastY - ypos;
    
    lastX = xpos;
    lastY = ypos;
    
    camera.ProcessMouseMovement(xoffset, yoffset);
}

void scroll_callback(GLFWwindow* window, double xoffset, double yoffset)
{
    camera.ProcessMouseScroll(yoffset);
}

#pragma endregion