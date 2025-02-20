# Retain conversation then design a 'course' or lets say crash course on the subject the user wants
# https://github.com/codedidit/learnanything/blob/main/.swm/a-easy-walkthrough.h6ljq0t6.sw.md
# you can run each step with the metaprompt too


# ## Example full prompt


# ## Generalized Follow-Up Prompt Framework

# Here's how you can prompt the chatbot for any subject while maintaining flexibility and depth:

# ### Starting or Moving Forward

# **Prompt Options:**

# ### Public Speaking Example

# - **Module 1:** *"I'm ready to start Module 1: The Foundations of Public Speaking. Can you break it down step-by-step, provide examples, and include a practice task?"*
# - **Review:** *"Can you summarize how to structure an effective speech and give me a short practice task?"*
# - **Project:** *"Can you design a project where I write and deliver a 2-minute speech? Provide tips and evaluate my performance."*

# ### Quick Reference Guide

# To get the most value from this course, you can use the following prompts at any point:

# - **Start a Module:** 'I'm ready for [Module Name]. Teach me step-by-step with examples.'
# - **Request a Review:** 'Can you summarize [specific topic] and include a quick test?'
# - **Ask for Hands-On Practice:** 'Give me a practical exercise on [topic].'
# - **Seek Advanced Learning:** 'Can we go deeper into [concept] with a challenge?'
# - **Request Feedback:** 'Here's my answer: [insert]. How did I do?'
# - **Plan Next Steps:** 'What's next after this course? Recommend projects or paths.'

from openai import OpenAI

from datetime import datetime
import os
def getApiKey():
    """
    gets api key from apiKey.config, starts with main:
    """
    with open("./apiKey.config") as f:
        api_key = next((line[5:].strip() for line in f.readlines() if line.startswith("main:")), None)
        if api_key is None:
            raise ValueError("API key not found in apiKey.config")
        return api_key
def getBaseUrl():
    """
    gets base url from apiKey.config, starts with base-url:
    """
    with open("./apiKey.config") as f:
        baseUrl = next((line[9:].strip() for line in f.readlines() if line.startswith("base-url:")), None)
        if baseUrl is None:
            raise ValueError("baseUrl not found in apiKey.config")
        return baseUrl

def readMdFile(filepath):
    """
    Read a markdown file
    
    Args:  
        filepath: Path to markdown file to read
    Returns:          
        str: Content of the file
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            print(f"File read successfully: {filepath}")
            return file.read()
    except FileNotFoundError:
        print(f"File not found: {filepath}")
        return None

def writeMdFile(filepath, content):
    """
    Append content to a markdown file
    Args:
        filepath: Path to markdown file
        content: Content to append
    Returns:   
        bool: True if content was written successfully, False otherwise
    """
    try:
        with open(filepath, 'a', encoding='utf-8') as file:
            file.write(content)
        return True
    except Exception as e:
        print(f"Error writing to file: {e}")
        return False

def clearMdFile(filepath):
    """
    Clears MD file content while backing up existing content
    Args:
        filepath: Path to markdown file
    Returns:
        bool: Success status
    """
    try:
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
                if content.strip():
                    # Create backup with timestamp
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    backup_path = f"{filepath[:-3]}_{timestamp}.md"
                    with open(backup_path, 'w', encoding='utf-8') as backup:
                        backup.write(content)
                        print(f"Backup created: {backup_path}")
        # Clear original file
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write('')
            print(f"File cleared: {filepath}")
        return True
    except Exception as e:
        print(f"Error clearing file {filepath}: {e}")
        return False


#deepseek-reasoner, gpt-4o or gpt-4o-mini
def getCompletion(model, prompt, system_prompt, output_path):
    """
    Get completion from OpenAI API
    Args:
        model: Model to use for completion -> String
        prompt: User input prompt
        system_prompt: System input prompt
        output_path: Path to save output
    Returns:
      str: Completion from OpenAI API
    """
    client = OpenAI(api_key=getApiKey(), base_url=getBaseUrl())

    # tools = [
    #     {
    #         "type": "function",
    #         "function": {
    #             "name": "get_current_weather",
    #             "description": "Get the current weather in a given location",
    #             "parameters": {
    #                 "type": "object",
    #                 "properties": {
    #                     "location": {
    #                         "type": "string",
    #                         "description": "The city and state, e.g. San Francisco, CA",
    #                     },
    #                     "unit": {
    #                         "type": "string", 
    #                         "enum": ["celsius", "fahrenheit"]},
    #                 },
    #                 "required": ["location"],
    #             },
    #         },   
    #     }
    # ]

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt}, #develoepr role for some other modedls, 4omini only sys
                {"role": "user", "content": prompt}
            ],
            #tools=tools,
            stream=True,
        )
        for chunk in response:
            if chunk.choices:
                writeMdFile(output_path, chunk.choices[0].delta.content or "")
        print(f"File writing ended: {output_path}")
    except Exception as e:
        print(f"Error: {e}")

def main():
    inputFilePath = "input.md"
    outputFilePath = "output.md"
    promptOutputFilePath = "promptOutput.md"

    coursePrompt = readMdFile("prompts/crashCoursePrompt.md")
    metaPrompt = readMdFile("prompts/metaPrompt.md")
    
    generatePrompt = False
    generatePromptPreText = ""
    userPrompting = True
    # you should always use R1 for generating prompts that require good formatting and examples ex.marking/giving feedback.
    # you should use 4omini for generating prompts that are more general and you need to follow the constraints
    # answers you can  ask both then combine or let user choose one
    if generatePrompt:
        #get generated prompt
        clearMdFile(promptOutputFilePath)
        getCompletion("gpt-4o-mini", "new prompt:" + generatePromptPreText,coursePrompt, promptOutputFilePath)
    if userPrompting:
        userPrompt = readMdFile(inputFilePath)
        clearMdFile(outputFilePath)
        getCompletion("deepseek-reasoner", userPrompt, readMdFile(promptOutputFilePath), outputFilePath)




if __name__=="__main__":
    main()