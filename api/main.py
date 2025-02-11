from openai import OpenAI

preprompt = "Hello"
print(preprompt)

userPrompt = "Who are you? Explain how you work."
userPrompt = input("Prompt: ")

with open("./api/apiKey.config") as f:
    api_key = next((line[5:].strip() for line in f.readlines() if line.startswith("main:")), None) 
    if api_key is None:
        print("API key not found in apiKey.config")
        exit(1)
    print(api_key)

client = OpenAI(
  api_key=api_key
)

completion = client.chat.completions.create(
  model="gpt-4o-mini",
  store=True,
  messages=[
    {"role": "user", "content": "write a haiku about ai"}
  ]
)

print(completion.choices[0].message);