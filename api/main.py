# this will be the AQA english analysis and feedback testing agent
from openai import OpenAI

# preprompt = "Hello"
# print(preprompt)


# oxford AQA iGCSE English Literature
# Grade essays with deatiled feedback for AQA iGCSE
#meta prompt will be the template for now
def getApiKey():
    with open("./apiKey.config") as f:
        api_key = next((line[5:].strip() for line in f.readlines() if line.startswith("main:")), None)
        if api_key is None:
            raise ValueError("API key not found in apiKey.config")
        return api_key
def getBaseUrl():
    with open("./apiKey.config") as f:
        baseUrl = next((line[9:].strip() for line in f.readlines() if line.startswith("base-url:")), None)
        if baseUrl is None:
            raise ValueError("baseUrl not found in apiKey.config")
        return baseUrl

def readMdFile(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            print(f"File read successfully: {filepath}")
            return file.read()
    except FileNotFoundError:
        print(f"File not found: {filepath}")
        return None

def writeMdFile(filepath, content):
    try:
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"File written successfully: {filepath}")
        return True
    except Exception as e:
        print(f"Error writing to file: {e}")
        return False


#deepseek-reasoner, gpt-4o or gpt-4o-mini
def getCompletion(prompt, system_prompt):
    client = OpenAI(api_key=getApiKey(), base_url=getBaseUrl())
    try:
        response = client.chat.completions.create(
            model="deepseek-reasoner",
            messages=[
                {"role": "system", "content": system_prompt}, #develoepr role for some other modedls, 4omini only sys
                {"role": "user", "content": prompt}
            ]
        )
    except Exception as e:
        return f"Error: {e}"
   
    try:
        return response
    except Exception as e:
        return f"Error: {e}"

def main():
    inputFilePath = "input.md"
    outputFilePath = "output.md"
    promptOutputFilePath = "promptOutput.md"

    aqaPrompt = readMdFile("prompts/aqaPrompt.md")
    metaPrompt = readMdFile("prompts/metaPrompt.md")

    generatePrompt = False
    userPrompting = True
    
    if generatePrompt:
        #get generated prompt
        genPrompt = getCompletion("new prompt", aqaPrompt).choices[0].message.content
        writeMdFile(promptOutputFilePath, genPrompt)

    
    if userPrompting:
        #get user essay input
        userPrompt = readMdFile(inputFilePath)
        if userPrompt is None:
            print("Input file empty")
            return
        response = getCompletion(userPrompt, readMdFile(promptOutputFilePath)).choices[0].message.content
        writeMdFile(outputFilePath, response)



if __name__=="__main__":
    main()