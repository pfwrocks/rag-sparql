import { Configuration, OpenAIApi } from 'openai-edge'
import { Message, OpenAIStream, StreamingTextResponse } from 'ai'
import { getContext } from '@/utils/context'

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

export async function POST(req: Request) {
  try {

    const { messages } = await req.json()

    // Get the last message
    const lastMessage = messages[messages.length - 1]

    // Get the context from the last message
    // const context = await getContext(lastMessage.content, '')


    const prompt = [
      {
        role: 'system',
        content: `AI assistant is a powerful artificial intelligence.
      AI is an excellent planner capable of taking complex requests and breaking them down step-by-stp.
      AI is able to convert requests into a series of queries that will help solve the problem.
      AI can use tools such as a Calendar, CookBook, and Messages.
      When AI wishes to query one of these tools, it will use the form 'initiate_query(CALENDAR, query)' where query is the high-level query that AI wishes to run.
      AI start off by using a scratch pad, and then, only when ready will AI use the 'initiate_query' functions
      AI will make sure that 'initiate_query' functions are always on their on separate line.
      AI will compose a full list of queries necessary to be run.
      AI will store the queries as a variable and if a query requires information from a previous query, it will reference that variable name as a third parameter in the initiate_query function.
      Query:
      ${lastMessage}
      `,
      },
    ]

    // Ask OpenAI for a streaming chat completion given the prompt
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [...prompt, ...messages.filter((message: Message) => message.role === 'user')]
    })
    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response)
    // Respond with the stream
    return new StreamingTextResponse(stream)
  } catch (e) {
    throw (e)
  }
}