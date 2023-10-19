import { z } from "zod";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { StructuredOutputParser, OutputFixingParser } from "langchain/output_parsers";
import { RunnableSequence } from "langchain/schema/runnable";
import { executeSparql } from "./queries";

export const genSparql = async (lastMessage: any): Promise<string> => {

    // Get the context from the last message
    //const context = await getContext(lastMessage.content, '');
    //console.log("CONTEXT: " + context);

    const returnParser = StructuredOutputParser.fromZodSchema(
        z.object({
          queries: z
            .array(z.string())
            .describe("SPARQL query"),
          description: z
            .array(z.string())
            .describe("description of SPARQL query"),
        })
    );

    const queryChain = RunnableSequence.from([
        PromptTemplate.fromTemplate(`
        Write one or more SPARQL queries that would answer the user's question. Utilize only the predicate URIs explicitly listed in the JSON-LD schema example in the reference section. Never use any predicate URIs not listed in the schema reference. Always apply the necessary PREFIX references in the query and use shorthand notation. Aim for a query that is concise and efficient. Incorporate additional terms into SPARQL FILTERs based on the query's context, using OR logic. For a query about 'movies in space,' add terms like 'galaxy' or 'stars.' Limit to 10 additional terms. When utilizing SPARQL CONTAINS, use single-word values. For instance, split "movie night" into separate CONTAINS for "movie" and "night". Alternatively, use the '|' character to separate such values within a single CONTAINS statement. The queries should never return more than 15 results. Queries should be on one line only. Ensure all queries have valid syntax and ensure they are directly executable. Do think before returning your answer. Use some scratch space if needed, but do not return it to the user. Keep in mind the semantic meaning behind the predicates when making your queries.
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
        QUESTION: {question}
        -----------------
        FORMATTING INSTRUCTIONS:
        {format_instructions}
        -----------------
        QUERIES: 
        `),
        new OpenAI({ temperature: 0, modelName: "gpt-3.5-turbo" }),
        returnParser,
    ]);
      
    const res = await queryChain.invoke({
        question: lastMessage.content,
        format_instructions: returnParser.getFormatInstructions(),
    });

    const results = [];
    for (let i = 0; i < res.queries.length; i++) {
        const qres = await executeSparql(res.queries[i]);
        results.push(qres);
    }

    const joinedResult: string = results.map(result => JSON.stringify(result)).join(',');

    console.log("SPARQL RESULTS: " + joinedResult);

  return joinedResult;
}
