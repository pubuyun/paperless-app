from openai import OpenAI
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from datetime import datetime
import os
import json

# this will be the AQA english analysis and feedback testing agent
# oxford AQA iGCSE English Literature
# estimate grades for essays with detailed, useful feedback for AQA iGCSE
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
                    # create backup with timestamp
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    backup_path = f"{filepath[:-3]}_{timestamp}.md"
                    with open(backup_path, 'w', encoding='utf-8') as backup:
                        backup.write(content)
                        print(f"Backup created: {backup_path}")
        # clear file
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
                {"role": "system", "content": system_prompt}, #develoepr role for some other models, 4omini only sys
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



app = FastAPI()
# add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  ############## In production, replace with the frontend URL##############
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/")
async def chat_endpoint(request: Request):
    data = await request.json()
    messages = data.get("messages", [])
    

    # moodels we allow, for backend checking
    # added custom models and distilled ones later
    valid_models = [
                    "gpt-4o", # openais flagship model, expensive
                    "gpt-4o-mini", # like 4o but faster, cheap and efficient can offer for free
                    "o3-mini", # cheaper than 4o, a small fast, super smart reasoning model
                    "deepseek-reasoner", # industtry breaking cheap and effective reasoning model
                    "deepseek-chat", # deepseek's direct prediction model
                    "claude-3-5-sonnet-20241022", # smart model for complex problems
                    "gemini-2.0-flash", # google's flagship fast model
                    "qwen2.5-32b-instruct", # opensource model from china, alibaba
                    "Doubao-pro-128k", # erm what the
                    "llama3.3-70b-instruct", # industry-leading speed in open source model
                    ] 
    model = data.get("model") #get the model from request
    
    print("\n=== Request Details ===")
    print(f"Raw data received: {data}")
    print(f"Model from request: {model}")
    
    # model validation
    if model not in valid_models:
        print(f"Invalid model: '{model}', falling back to gpt-4o-mini")
        model = "gpt-4o-mini"
    else:
        print(f"Using model: {model}")
    
    # print("\n=== Conversation History ===")
    # for msg in messages:
    #     role = msg["role"].upper()
    #     content = msg["content"]
    #     print(f"\n{role}: {content}")
    # print("\n=== Assistant Response ===")
    
    client = OpenAI(api_key=getApiKey(), base_url=getBaseUrl())
    async def generate():
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                stream=True,
            )
            
            # full_response = ""
            for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    # full_response += content
                    # yield f"data: {content}\n\n"
                    
                    # hopefully json will encode it and preserve new lines
                    # yield f"data: {json.dumps(content)}\n\n\n"
                    yield f"{content}"
                    writeMdFile("debug.md", content)


        except Exception as e:
            error_msg = f"Error: {str(e)}"
            print(f"\n{error_msg}\n")
            yield f"data: {error_msg}\n\n"
            
    return StreamingResponse(generate(), media_type="text/event-stream")

def main():
    inputFilePath = "input.md"
    outputFilePath = "output.md"
    promptOutputFilePath = "promptOutput.md"

    aqaPrompt = readMdFile("prompts/aqaPrompt.md")
    metaPrompt = readMdFile("prompts/metaPrompt.md")
    
    generatePrompt = False
    generatePromptPreText = """
                            i need help with my gothic story writing, fixing stuff, making stuff better, adding new stuff, making current stuff more effective , and the story more engaging.
                            it is a short gothic story talking about a new law firm hire that is presented with a task that is unethical. and this task was abnormally assigned to him in 2015, and the story is in 2025. all the other people did this stuff when they joined too. you haed into the mansion of the client and observe weird stuff that happened to the people that defied him and he asks you to do some dirty work, you think of orientation witnessing all those weird stuff and now this. 
                            I need to fix the following things. but please keep portions of what i wrote.
                            i want the story to feel uncomfortable, strange, and you are always being commanded and forced to climb the coporate ladder and help the clients.
                            i ened to fix  the storyline, it is a bit messy. then what the character you is doing is not that clear, the mainsoin part can be shorter but more dense. the haunting and abnormal stuff can be clearer
                            """
    userPrompting = False
    
    # you should always use R1 for generating prompts that require good formatting and examples ex.marking/giving feedback.
    # you should use 4omini for generating prompts that are more general and you need to follow the constraints
    # answers you can  ask both then combine or let user choose one
    if generatePrompt:
        #get generated prompt
        clearMdFile(promptOutputFilePath)
        getCompletion("gpt-4o-mini", "new prompt:" + generatePromptPreText,metaPrompt, promptOutputFilePath)
    if userPrompting:
        userPrompt = readMdFile(inputFilePath)
        clearMdFile(outputFilePath)
        getCompletion("deepseek-reasoner", userPrompt, readMdFile(promptOutputFilePath), outputFilePath)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    # main()