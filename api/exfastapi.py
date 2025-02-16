from fastapi import FastAPI, HTTPException
import os
import httpx

app = FastAPI()
DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions"
async def deepseek_query(prompt: str):
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            response = await client.post(
                DEEPSEEK_URL,
                headers={"Authorization": f"Bearer {os.getenv('DEEPSEEK_API_KEY')}"},
                json={
                    "model": "deepseek-chat",
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False
                }
            )
            return response.json()["choices"][0]["message"]["content"]
        except (KeyError, httpx.RequestError) as e:
            # Implement fallback strategy here
            raise HTTPException(status_code=503, detail="Service unavailable")
        

# # Example Python error handling
# try:
#     response = requests.post(
#         "https://api.deepseek.com/v1/chat/completions",
#         headers={"Authorization": f"Bearer {os.getenv('DEEPSEEK_API_KEY')}"},
#         json=payload,
#         timeout=10
#     )
#     response.raise_for_status()
# except requests.exceptions.HTTPError as err:
#     # Handle specific error codes from Deepseek API
#     if err.response.status_code == 429:
#         implement_retry_logic()
#     else:
#         logging.error(f"API request failed: {err}")