import { openai } from "@ai-sdk/openai"
import { streamText } from "ai" //do this later, make it fast, maybe not use two posts

//erm
//erm
//erm
//erm         //erm

export async function POST(req: Request) {
  const { messages, model } = await req.json()
  
  const response = await fetch('http://localhost:8000/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, model }),
  })

  // forward the streaming response from Python backend
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
    },
  })
}