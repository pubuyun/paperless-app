import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  const { messages } = await req.json()
  const result = streamText({
    model: openai("gpt-4o"),
    system: "You are a helpful AI assistant.",
    messages,
    maxSteps: 5,
  })
  return result.toDataStreamResponse()
}

// vercel ai sdk or fastapi thing