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
import { sendDiscordMessage } from '@/utils/discord';

export const runtime = 'edge'

// History formatter
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

// Define models
const gpt4 = new OpenAI({
  modelName: "gpt-4",
  streaming: true,
  temperature: 0.2
});

const gpt3 = new OpenAI({
  modelName: "gpt-3.5-turbo",
  streaming: true,
  temperature: 0.5
});

const chatGpt3 = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  streaming: true,
  temperature: 0.5
});

// Define data schemas
const topics: { [key: string]: string } = {
  movie: `
  MOVIE SCHEMA
  Prefixes to add:
  \`\`\`
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  PREFIX schem: <https://schema.org/>
  \`\`\`
  
  Format example of a movie in JSON-LD:
  \`\`\`json
  {{"@context":{{"dct":"http://purl.org/dc/terms/","xsd":"http://www.w3.org/2001/XMLSchema#","schem":"https://schema.org/","a":"@type","created":{{"@id":"dct:created","@type":"xsd:dateTime"}},"modified":{{"@id":"dct:modified","@type":"xsd:dateTime"}},"endTime":{{"@id":"schem:endTime","@type":"xsd:dateTime"}},"startTime":{{"@id":"schem:startTime","@type":"xsd:dateTime"}},"datePublished":{{"@id":"schem:datePublished","@type":"xsd:dateTime"}},"genre":"schem:genre","keywords":"schem:keywords","image":"schem:image","name":"schem:name","sameAs":"schem:sameAs","description":"schem:description","object":{{"@id":"schem:object","@type":"@id"}},"actor":{{"@id":"schem:actor","@type":"@id"}}}},"@id":"#b995e4fa-4222-45ff-819f-febc4e4296d2","@type":"schem:WatchAction","created":"2023-09-27T23:54:16Z","endTime":"2023-09-27T23:54:16Z","startTime":"2023-09-27T23:54:16Z","object":"#it","it":{{"@id":"#it","@type":"schem:Movie","created":"2023-09-27T23:54:16Z","modified":"2023-09-27T23:54:16Z","datePublished":"1979-05-25T00:00:00Z","description":"Alien","image":"https://image.org/M.jpg","name":"Alien","sameAs":"https://www.imdb.com","genre":"Science, Horror","keywords":"alien, space","actor":"#johnHurt"}},"johnHurt":{{"@id":"#johnHurt","@type":"schem:Person","name":"John Hurt","sameAs":"https://www.imdb.com"}}}}
  \`\`\``,
  recipe: `
  RECIPE SCHEMA
  Prefixes to add:
  \`\`\`
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  PREFIX schem: <https://schema.org/>
  PREFIX crdt: <https://vocab.noeldemartin.com/crdt/>
  \`\`\`

  Format example of a recipe in JSON-LD:
  \`\`\`json
  {"@context":{"xsd":"http://www.w3.org/2001/XMLSchema#","schem":"https://schema.org/","crdt":"https://vocab.noeldemartin.com/crdt/","scr":"https://www.allrecipes.com/recipe/258968/scrambled-eggs-with-chorizo/"},"@graph":[{"@id":"#2d4","@type":"schem:HowToStep","schem:position":1,"schem:text":"Grease a large nonstick skillet"},{"@id":"#2d4-metadata","@type":"crdt:Metadata","crdt:createdAt":{"@type":"xsd:dateTime","@value":"2023-10-05T17:58:52.419Z"},"crdt:resource":{"@id":"#2d4"},"crdt:updatedAt":{"@type":"xsd:dateTime","@value":"2023-10-05T17:58:52.419Z"}},{"@id":"#8a7","@type":"schem:HowToStep","schem:position":2,"schem:text":"Whisk together eggs"},{"@id":"#8a7-metadata","@type":"crdt:Metadata","crdt:createdAt":{"@type":"xsd:dateTime","@value":"2023-10-05T17:58:52.419Z"},"crdt:resource":{"@id":"#8a7"},"crdt:updatedAt":{"@type":"xsd:dateTime","@value":"2023-10-05T17:58:52.419Z"}},{"@id":"#it","@type":"schem:Recipe","schem:cookTime":"PT10M","schem:description":"This chorizo and egg recipe is quick","schem:image":"678f45d37cc14cffb8b165128cb20c82.jpg","schem:name":"Scrambled Eggs","schem:prepTime":"PT5M","schem:recipeIngredient":["6 large eggs","cooking spray"],"schem:recipeInstructions":[{"@id":"#2d4"},{"@id":"#8a7"}],"schem:recipeYield":"2","schem:sameAs":{"@id":"scr:"}},{"@id":"#it-metadata","@type":"crdt:Metadata","crdt:createdAt":{"@type":"xsd:dateTime","@value":"2023-10-05T17:58:52.418Z"},"crdt:resource":{"@id":"#it"},"crdt:updatedAt":{"@type":"xsd:dateTime","@value":"2023-10-05T17:58:52.418Z"}}]}
  \`\`\`
  `,
  chat: `
  CHAT SCHEMA
  Prefixes to add:
  \`\`\`
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX sioc: <http://rdfs.org/sioc/ns#>
  PREFIX wf: <http://www.w3.org/2005/01/wf/flow#>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  \`\`\`

  Format example of a chat log in JSON-LD:
  \`\`\`json
  {"@context":{"dct":"http://purl.org/dc/terms/","foaf":"http://xmlns.com/foaf/0.1/","rdfs":"http://www.w3.org/2000/01/rdf-schema#","sioc":"http://rdfs.org/sioc/ns#","wf":"http://www.w3.org/2005/01/wf/flow#","xsd":"http://www.w3.org/2001/XMLSchema#"},"@graph":[{"@id":"#George","@type":"foaf:Person","foaf:name":"George"},{"@id":"#Jordan","@type":"foaf:Person","foaf:name":"Jordan"},{"@id":"#Conversation1","@type":"sioc:Thread","sioc:has_creator":{"@id":"#George"},"dct:created":{"@type":"xsd:dateTime","@value":"2023-10-10T18:00:00Z"},"sioc:content":"Hey Jordan!"},{"@id":"#Conversation2","@type":"sioc:Thread","sioc:has_creator":{"@id":"#Jordan"},"dct:created":{"@type":"xsd:dateTime","@value":"2023-10-10T18:05:00Z"},"sioc:content":"No way"}]}
  \`\`\`
  `,
  calendar: `
  CALENDAR SCHEMA
  Prefixes to add:
  \`\`\`
  PREFIX time: <http://www.w3.org/2006/time#>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  \`\`\`

  Format example of a calendar event in JSON-LD:
  \`\`\`json
  {"@context":{"time":"http://www.w3.org/2006/time#","xsd":"http://www.w3.org/2001/XMLSchema#","rdfs":"http://www.w3.org/2000/01/rdf-schema#"},"@graph":[{"@id":"#Halloween","@type":"time:Interval","time:hasBeginning":{"@id":"#Event5Start"},"time:hasEnd":{"@id":"#Event5End"},"rdfs:label":{"@type":"xsd:string","@value":"Halloween"},"rdfs:comment":{"@type":"xsd:string","@value":"Celebrate"}},{"@id":"#Event5Start","@type":"time:Instant","time:inXSDDateTime":{"@type":"xsd:dateTime","@value":"2023-10-26T21:00:00Z"},"rdfs:label":{"@type":"xsd:string","@value":"Event Start"}},{"@id":"#Event5End","@type":"time:Instant","time:inXSDDateTime":{"@type":"xsd:dateTime","@value":"2023-10-27T02:00:00Z"},"rdfs:label":{"@type":"xsd:string","@value":"Event End"}}]}
  \`\`\`
  `,
};

export async function POST(req: NextRequest) {
  try {
    // Get the past messages from request body
    const { messages } = await req.json();
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);

    // Get the last message sent
    const lastMessage = messages[messages.length - 1].content;

    // Determine if the message is asking a question and whether or not it is a question that should be answered with a sparql query
    const routerChain = RunnableSequence.from([PromptTemplate.fromTemplate(`
      Classify the piece of text delimited by <> as "sparql" if it is related to the user's personal data concerning movies, messages, recipes, or calendar events. If it doesn’t fall within these categories, label it as "general." Each text should receive only one of these two classifications. Take the past messages into account when making this classification, especially if it is a follow up question that is related to personal data. Try to lean a little more to the sparql side, try to only use "general" if it is a more general question about you (the chatbot) or about Datacrate.io.
      -----------------
      Past messages:
      {chat_history}
      -----------------
      Text to classify:
      <{question}>
    `),
    gpt3,
    new StringOutputParser(),
    ]);

    // Chain for general questions that do not initiate a SPARQL query
    const generalChain = PromptTemplate.fromTemplate(`
      You're Datacrate.io's AI assistant, you can answer questions about the company and your abilities. If unsure how to respond, apologize to the user. Keep answers brief. Questions will be within <>.
      -----------------
      Company info to refer to:
      Datacrate.io provides long-term memory LLMs for centralized private data from privacy focused apps.

      What is Datacrate.io going to make? Description of Datacrate's product and what it does or will do.

      Datacrate.io is creating a platform that empowers users with self-governance over every aspect of their digital life in one place. We provide data storage in a standardized, interoperable format, ensuring all privileged apps can access it freely, eliminating vendor lock-in and dismantling network effects. Our infrastructure will enable developers to craft privacy-by-default apps that are user-run, thus providing robust assurances for data privacy. By centralizing personal knowledge graphs, we're enabling LLMs to manage and retrieve personal data, fostering long-term memory while preserving user autonomy.

      What this demo is:

      We have created this MVP for grounding an LLM in semantic data for more effective retrieval. This is a small part of the grand vision, but we built this part first because we believe it has the best product-market fit currently. Everyone is trying to use vector DBs as a way to effectively feed their knowledge into a model. We think that while a vector DB has its uses, this will not be the long-term strategy for memory retrieval. We can already demonstrate some benefits with our simple MVP, such as not having to recompute embeddings when swapping between models or updating information.

      Why did we pick this idea to work on? Do we have domain expertise in this area? How do we know people need what you're making?

      Datacrate.io embarked on this venture driven by our personal commitment to privacy and the rising consciousness amongst consumers about the exploitation of their data. We foresee AI becoming an integral part of daily life, and without adequate precautions, existing privacy challenges will only intensify. Our team possesses extensive experience up and down the stack, and we are quickly learning and building to get up to speed on semantic web technologies. We believe the current limitations of long-term memory in LLM models could be solvable with knowledge graphs and semantic data. The growing concern and proactive steps taken by the general public to shield their data is a testament to the pressing need for a transparent solution that empowers the user.
      -----------------
      Your abilities:
      You are able to

      - Answer any questions regarding Datacrate.io, Do not make up answers, if you do not know the answer, apologize to the user.

      - Query the generated user data. You may give the user an example like "Have I seen any movies from the 80s this year?" or "What was the last thing I sent Preston?" or "Do I have any recipes that use Eggs?" if they ask what you are able to do.
      
      - If asked where this data comes from, here is a description of where it comes from:
        
        All the data this assistant searches through is user data we have curated. In the actual product this would a users data from across multiple apps. This gives the user the power to query their whole lifes data with their own private virtual assistant.
      -----------------
      Chat history:
      {chat_history}
      -----------------
      Question: <{question}>
    `).pipe(chatGpt3).pipe(new BytesOutputParser());

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

    // Chain to determine topics of SPARQL query
    const topicChain = PromptTemplate.fromTemplate(`
      Classify the piece of text delimited by <>. Take the past messages into account when making this classification, especially if it is a follow up question. When responding, you should use as many classifications as needed for the text, it is better to classify more instead of less. Respond only with the classifications separated by commas.
      Classifications:
      - "movie" - anything relating to movies or watching them
      - "recipe" - anything related to recipes, cooking, or eating
      - "chat" - anything related to chatting, messages, sending, conversations
      - "calendar" - anything related to time, events, plans
      -----------------
      PAST MESSAGES:
      {chat_history}
      -----------------
      TEXT TO CLASSIFY:
      <{question}>
    `).pipe(gpt3).pipe(new StringOutputParser());

    // Chain to generate SPARQL queries
    const sparqlChain = PromptTemplate.fromTemplate(`
      Write one or more SPARQL queries that would answer the user's question. Utilize only the predicate URIs explicitly listed in the JSON-LD schema example in the reference section. Never use any predicate URIs not listed in the schema reference. Always apply the necessary PREFIX references in the query and use shorthand notation. Aim for a query that is concise and efficient. Incorporate additional terms into SPARQL FILTERs based on the query's context, using OR logic. For a query about 'movies in space,' add terms like 'galaxy' or 'stars.' Limit to 10 additional terms. When using a string in your query, prefer to use CONTAINS instead of doing a direct match. When utilizing SPARQL CONTAINS, use single-word values. For instance, split "movie night" into separate CONTAINS for "movie" and "night". Alternatively, use the '|' character to separate such values within a single CONTAINS statement. The queries should never return more than 15 results. Queries should be on one line only. Ensure all queries have valid syntax and ensure they are directly executable. Do think before returning your answer. Use some scratch space if needed, but do not return it to the user. Keep in mind the semantic meaning behind the predicates when making your queries.
      -----------------
      EXAMPLE QUERIES:
      {pinecone_results}
      -----------------
      SCHEMA REFERENCE: 
      {topic_data}
      -----------------
      CURRENT CONVERSATION:
      {chat_history}
      -----------------
      QUESTION: {question}
      -----------------
      FORMATTING INSTRUCTIONS:
      {format_instructions}
    `).pipe(gpt4).pipe(sparqlParser);

    // Chain to give the final response to users after a SPARQL chain
    const responseChain = PromptTemplate.fromTemplate(`
      You are an AI assistant for Datacrate.io users ask you questions and you return an answer in a polite manner. The question asked is below below delimited by <>. The fetched results are from a query that could assist with the answer, the results are delimited by triple apostrophes. Based on the question asked, and the json results of the query, summarize an answer to return to the user. If there are URLs ending with .jpg file extensions, always list these values to the user, but do not refer to them, just pass the raw URLs back. When summarizing the answer, never directly mention the query, act like you knew or didn't know the information directly.
      -----------------
      CURRENT CONVERSATION:
      {chat_history}
      -----------------
      Question:
      <{question}>
      -----------------
      Results:
      '''{results}'''
    `).pipe(chatGpt3).pipe(new BytesOutputParser());

    if (process.env.DEV_ENV === 'true') {
      console.log("no discord webhook called in dev mode")
    } else {
      const loc = req.geo?.city
      sendDiscordMessage(loc, lastMessage);
    }

    // invoke the router chain
    const routerRes = await routerChain.invoke({
      question: lastMessage,
      chat_history: formattedPreviousMessages.join("\n"),
    });

    if (routerRes.toLowerCase().includes("sparql")) {

      const pinecone_results = await getContext(lastMessage);

      const topicRes = await topicChain.invoke({
        question: lastMessage,
        chat_history: formattedPreviousMessages.join("\n"),
      });

      const topicData: string[] = [];
      const topicResFormat = topicRes.split(',').map(s => s.trim());
      for (const i of topicResFormat) {
        if (topics.hasOwnProperty(i)) {
            topicData.push(topics[i]);
        }
      }

      const sparqlQueries = await sparqlChain.invoke({
        question: lastMessage,
        chat_history: formattedPreviousMessages.join("\n"),
        topic_data: topicData.join("\n"),
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

      const baseQueries = Buffer.from(JSON.stringify(sparqlQueries.queries)).toString('base64');
      const baseDescriptions = Buffer.from(JSON.stringify(sparqlQueries.description)).toString('base64');
      const baseResults = Buffer.from(JSON.stringify(qResults)).toString('base64');

      return new StreamingTextResponse(stream, {
        headers: {
          "x-queries": baseQueries,
          "x-descriptions": baseDescriptions,
          "x-results": baseResults,
        },
      });
    } else if (routerRes.toLowerCase().includes("general")) {

      const stream = await generalChain.stream({
        question: lastMessage,
        chat_history: formattedPreviousMessages.join("\n"),
      });
      return new StreamingTextResponse(stream, {
        headers: {
          "x-queries": '["None"]',
          "x-descriptions": '["This question could be answered without a SPARQL query, utilizing a general chatbot prompt instead."]',
          "x-results": '["None"]',
        },
      });
    } else {

      const stream = await generalChain.stream({
        question: lastMessage,
        chat_history: formattedPreviousMessages.join("\n"),
      });
      return new StreamingTextResponse(stream, {
        headers: {
          "x-queries": "['None']",
          "x-descriptions": "['This question could be answered without a SPARQL query, utilizing a general chatbot prompt instead.']",
          "x-results": "['None']",
        },
      });
    }
  } catch (e) {
    console.log('/api/chat had an error')
    throw (e)
  }
}