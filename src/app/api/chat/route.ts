import { getContext } from '@/utils/context';
import { executeSparql } from '@/utils/queries';
import { StreamingTextResponse, Message as VercelChatMessage } from 'ai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAI } from "langchain/llms/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from 'langchain/prompts';
import { BytesOutputParser, StringOutputParser } from "langchain/schema/output_parser";
import { RunnableSequence } from "langchain/schema/runnable";
import { NextRequest } from 'next/server';
import { z } from "zod";

export const runtime = 'edge'

console.log('edge running!')

// History formatter
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

console.log('edge 2')

// Define models
const gpt3 = new OpenAI({
  modelName: "gpt-3.5-turbo",
  streaming: true,
  temperature: 0
});

console.log('edge 3')

const chatGpt3 = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  streaming: true,
  temperature: 0
});

console.log('edge 4')

export async function POST(req: NextRequest) {
  try {
    console.log('post 1')
    // Get the past messages from request body
    const { messages } = await req.json();
    console.log('post 2')
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    console.log('post 3')

    // Get the last message sent
    const lastMessage = messages[messages.length - 1].content;
    console.log('post 4')

    // Determine if the message is asking a question and whether or not it is a question that should be answered with a sparql query
    const routerChain = RunnableSequence.from([
      PromptTemplate.fromTemplate(
        `Classify text as "sparql" if it can be answered using user's movie, chat, recipes, or calendar data; otherwise, classify as "general". Only one classification should be applied. Do not classify as anything other than "general" or "sparql".
      -----------------
      Current conversation:
      {chat_history}
      -----------------
      Question: <{question}>
      `),
      gpt3,
      new StringOutputParser(),
    ]);

    console.log('post 5')

    // Chain for general questions that do not initiate a SPARQL query
    const generalChain = PromptTemplate.fromTemplate(
      `You're Datacrate.io's AI assistant, you can answer questions about the platform, user data, and your abilities. If unsure how to respond, apologize to the user. Keep answers brief. Questions will be within <>.
      -----------------
      Current conversation:
      {chat_history}
      -----------------
      Question: <{question}>
      `
    ).pipe(chatGpt3).pipe(new BytesOutputParser());

    console.log('post 6')

    // Set parser for the SPARQL chain
    const sparqlParser = StructuredOutputParser.fromZodSchema(
      z.object({
        queries: z
          .array(z.string())
          .describe("SPARQL query"),
        description: z
          .array(z.string())
          .describe("description of SPARQL query"),
      })
    );

    console.log('post 7')

    // Chain to generate SPARQL queries
    const sparqlChain = PromptTemplate.fromTemplate(
      `Write one or more SPARQL queries that would answer the user's question. Utilize only the predicate URIs explicitly listed in the JSON-LD schema example in the reference section. Never use any predicate URIs not listed in the schema reference. Always apply the necessary PREFIX references in the query and use shorthand notation. Aim for a query that is concise and efficient. Incorporate additional terms into SPARQL FILTERs based on the query's context, using OR logic. For a query about 'movies in space,' add terms like 'galaxy' or 'stars.' Limit to 10 additional terms. When utilizing SPARQL CONTAINS, use single-word values. For instance, split "movie night" into separate CONTAINS for "movie" and "night". Alternatively, use the '|' character to separate such values within a single CONTAINS statement. The queries should never return more than 15 results. Queries should be on one line only. Ensure all queries have valid syntax and ensure they are directly executable. Do think before returning your answer. Use some scratch space if needed, but do not return it to the user. Keep in mind the semantic meaning behind the predicates when making your queries.
      -----------------
      EXAMPLE QUERIES:
      {pinecone_results}
      -----------------
      SCHEMA REFERENCE: 
      Prefixes to add:
      \`\`\`
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX schem: <https://schema.org/>
      \`\`\`
          
      \`\`\`json
      {{"@context":{{"dct":"http://purl.org/dc/terms/","xsd":"http://www.w3.org/2001/XMLSchema#","schem":"https://schema.org/","a":"@type","created":{{"@id":"dct:created","@type":"xsd:dateTime"}},"modified":{{"@id":"dct:modified","@type":"xsd:dateTime"}},"endTime":{{"@id":"schem:endTime","@type":"xsd:dateTime"}},"startTime":{{"@id":"schem:startTime","@type":"xsd:dateTime"}},"datePublished":{{"@id":"schem:datePublished","@type":"xsd:dateTime"}},"genre":"schem:genre","keywords":"schem:keywords","image":"schem:image","name":"schem:name","sameAs":"schem:sameAs","description":"schem:description","object":{{"@id":"schem:object","@type":"@id"}},"actor":{{"@id":"schem:actor","@type":"@id"}}}},"@id":"#b995e4fa-4222-45ff-819f-febc4e4296d2","@type":"schem:WatchAction","created":"2023-09-27T23:54:16Z","endTime":"2023-09-27T23:54:16Z","startTime":"2023-09-27T23:54:16Z","object":"#it","it":{{"@id":"#it","@type":"schem:Movie","created":"2023-09-27T23:54:16Z","modified":"2023-09-27T23:54:16Z","datePublished":"1979-05-25T00:00:00Z","description":"Alien","image":"https://image.org/M.jpg","name":"Alien","sameAs":"https://www.imdb.com","genre":"Science, Horror","keywords":"alien, space","actor":"#johnHurt"}},"johnHurt":{{"@id":"#johnHurt","@type":"schem:Person","name":"John Hurt","sameAs":"https://www.imdb.com"}}}}
      \`\`\`
      -----------------
      CURRENT CONVERSATION:
      {chat_history}
      -----------------
      QUESTION: {question}
      -----------------
      FORMATTING INSTRUCTIONS:
      {format_instructions}
    `).pipe(gpt3).pipe(sparqlParser);

    console.log('post 8')

    // Chain to give the final response to users after a SPARQL chain
    const responseChain = PromptTemplate.fromTemplate(
      `You are an AI assistant for Datacrate.io users ask you questions and you return an answer in a polite manner. The question asked is below below delimited by <>. The fetched results are from a query that could assist with the answer, the results are delimited by triple apostrophes. Based on the question asked, and the json results of the query, summarize an answer to return to the user. Do not refer to the query or the results, just act like you knew the information and you're telling it to the user.
      -----------------
      CURRENT CONVERSATION:
      {chat_history}
      -----------------
      Question:
      <{question}>
      -----------------
      Results:
      '''{results}'''
      `
    ).pipe(chatGpt3).pipe(new BytesOutputParser());

    console.log('post 9')

    // invoke the router chain
    const routerRes = await routerChain.invoke({
      question: lastMessage,
      chat_history: formattedPreviousMessages.join("\n"),
    });

    console.log('post 10')

    if (routerRes.toLowerCase().includes("sparql")) {

      const pinecone_results = await getContext(lastMessage);

      const sparqlQueries = await sparqlChain.invoke({
        question: lastMessage,
        chat_history: formattedPreviousMessages.join("\n"),
        format_instructions: sparqlParser.getFormatInstructions(),
        pinecone_results: pinecone_results,
      });

      const qResults: string[] = [];
      for (let i = 0; i < sparqlQueries.queries.length; i++) {
        const qRes = await executeSparql(sparqlQueries.queries[i]);
        qResults.push(qRes);
      }

      const joinedResult: string = qResults.map(result => JSON.stringify(result)).join(',');

      console.log(`joinedResult: ${joinedResult}`);

      const stream = await responseChain.stream({
        question: lastMessage,
        chat_history: formattedPreviousMessages.join("\n"),
        results: joinedResult,
      });

      return new StreamingTextResponse(stream, {
        headers: {
          "x-queries": JSON.stringify(sparqlQueries.queries),
          "x-descriptions": JSON.stringify(sparqlQueries.description),
          "x-results": JSON.stringify(qResults),
        },
      });
    } else if (routerRes.toLowerCase().includes("general")) {

      const stream = await generalChain.stream({
        question: lastMessage,
        chat_history: formattedPreviousMessages.join("\n"),
      });
      return new StreamingTextResponse(stream);
    } else {

      const stream = await generalChain.stream({
        question: lastMessage,
        chat_history: formattedPreviousMessages.join("\n"),
      });
      return new StreamingTextResponse(stream);
    }
  } catch (e) {
    console.log('/api/chat had an error')
    throw (e)
  }
}