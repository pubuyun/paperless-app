from openai import OpenAI

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


#FINETUNE
openai.api_key = getApiKey()
openai.api_base = getBaseUrl()
# files
def files():
    resp = openai.File.create(
        file=open("mydata.jsonl", "rb"),
        purpose='fine-tune'
    )
    print(resp)
# jobs
def jobs(file_id):
    resp = openai.FineTuningJob.create(training_file=file_id, model="gpt-4o-mini")   #训练文件的id要从上一步获取得到
    print(resp)
# retrieve
def retrieve(ftid):
    resp = openai.FineTuningJob.retrieve(ftid)    #微调任务id要从上一步获取得到
    print(resp)




def getCompletion(prompt, system_prompt, output_path):
    """
    Get completion from OpenAI API
    Args:
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


    # model = "gpt-4"
    # model = "gpt-4o-mini"
    model = "deepseek-reasoner"
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

    
    except Exception as e:
        print(f"Error: {e}")

def main():
    files() # get print id



    inputFilePath = "input.md"
    outputFilePath = "output.md"
    promptOutputFilePath = "promptOutput.md"

    aqaPrompt = readMdFile("prompts/aqaPrompt.md")
    metaPrompt = readMdFile("prompts/metaPrompt.md")

    generatePrompt = False
    generatePromptPreText = ""
    userPrompting = False
    

   

    if generatePrompt:
        #get generated prompt
        getCompletion("new prompt:" + generatePromptPreText,aqaPrompt, promptOutputFilePath)
        

    
    if userPrompting:
        userPrompt = readMdFile(inputFilePath)
        if userPrompt is None:
            print("Input file empty")
            return
        getCompletion(userPrompt, readMdFile(promptOutputFilePath), outputFilePath)
    



if __name__=="__main__":
    main()