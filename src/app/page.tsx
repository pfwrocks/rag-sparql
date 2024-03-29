// page.tsx

"use client";

import Chat from "@/components/Chat";
import Header from "@/components/Header";
import { useChat } from "ai/react";
import React, { FormEvent, useRef, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import GraphAnimation from "./components/GraphAnimation";
import InstructionModal from "./components/InstructionModal";
import { Query } from "./components/Query/index";

// const queries: Query[] = [
//   {
//     query: `PREFIX schem: <https://schema.org/> SELECT ?movie WHERE { ?movie schem:description ?description . FILTER(CONTAINS(?description, 'space') || CONTAINS(?description, 'galaxy') || CONTAINS(?description, 'stars')) } LIMIT 15`,
//     description: `This query retrieves movies that have a description related to space, galaxy, or stars.`,
//     result: `{"head":{"vars":["movie"]},"results":{"bindings":[{"movie":{"type":"uri","value":"file:///staging/movies/walle-2008.ttl#it"}},{"movie":{"type":"uri","value":"file:///staging/movies/alien-1979.ttl#it"}},{"movie":{"type":"uri","value":"file:///staging/movies/interstellar-2014.ttl#it"}}]}}`
//   },
//   {
//     query: `PREFIX schem: <https://schema.org/> SELECT ?movie WHERE { ?movie schem:description ?description . FILTER(CONTAINS(?description, 'space') || CONTAINS(?description, 'galaxy') || CONTAINS(?description, 'stars')) } LIMIT 15`,
//     description: `This query retrieves movies that have a description related to space, galaxy, or stars.`,
//     result: `{"head":{"vars":["movie"]},"results":{"bindings":[{"movie":{"type":"uri","value":"file:///staging/movies/walle-2008.ttl#it"}},{"movie":{"type":"uri","value":"file:///staging/movies/alien-1979.ttl#it"}},{"movie":{"type":"uri","value":"file:///staging/movies/interstellar-2014.ttl#it"}}]}}`
//   },
//   {
//     query: `PREFIX schem: <https://schema.org/> SELECT ?movie WHERE { ?movie schem:description ?description . FILTER(CONTAINS(?description, 'space') || CONTAINS(?description, 'galaxy') || CONTAINS(?description, 'stars')) } LIMIT 15`,
//     description: `This query retrieves movies that have a description related to space, galaxy, or stars.`,
//     result: `{"head":{"vars":["movie"]},"results":{"bindings":[{"movie":{"type":"uri","value":"file:///staging/movies/walle-2008.ttl#it"}},{"movie":{"type":"uri","value":"file:///staging/movies/alien-1979.ttl#it"}},{"movie":{"type":"uri","value":"file:///staging/movies/interstellar-2014.ttl#it"}}]}}`
//   }
// ]

const Page: React.FC = () => {
  const [gotMessages, setGotMessages] = useState(true);
  const [context, setContext] = useState<string[] | null>(null);
  const [queries, setQueries] = useState<Query[]>([]);
  const [isModalOpen, setModalOpen] = useState(true);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
  onFinish: async () => {
    setGotMessages(true);
  },
  onResponse: async (response) => {

    console.log("chat response:")
    console.log(response)
    console.log('chat response headers')
    console.log(JSON.stringify(response.headers))

    // Extract headers from the response as strings
    const descsString = response.headers.get('x-descriptions');
    const queriesString = response.headers.get('x-queries');
    const resultsString = response.headers.get('x-results');

  console.log('descsString, queriesString, resultsString')
  console.log(`${descsString} ***** ${queriesString} ***** ${resultsString}`);

  // Check if headers exist
  if (!descsString || !queriesString || !resultsString) {
    throw new Error('desc, query, or result headers do not exist!');
  }
    const decDescsString: string = Buffer.from(descsString, 'base64').toString('utf8');
    const decQueriesString: string = Buffer.from(queriesString, 'base64').toString('utf8');
    const decResultsString: string = Buffer.from(resultsString, 'base64').toString('utf8');

    // After parsing
    if (!Array.isArray(JSON.parse(decDescsString))) {
        console.error('descsString is not a valid JSON array:', decDescsString);
    }
    if (!Array.isArray(JSON.parse(decQueriesString))) {
        console.error('queriesString is not a valid JSON array:', decQueriesString);
    }
    if (!Array.isArray(JSON.parse(decResultsString))) {
        console.error('resultsString is not a valid JSON array:', decResultsString);
    }

  // Parse the headers
  const descs = JSON.parse(decDescsString) as string[];
  const queries = JSON.parse(decQueriesString) as string[];  // Replace any[] if you have a specific type for queries
  const results = JSON.parse(decResultsString).map((result: any) => JSON.stringify(result)) as string[];  // Replace any[] if you have a specific type for results

  // Check if parsing was successful
  if (!descs || !queries || !results) {
    throw new Error('desc, query, or result parsing json');
  }

  // Ensure all parsed values are arrays
  if (Array.isArray(descs) && Array.isArray(queries) && Array.isArray(results)) {
    const numQueries = Math.min(descs.length, queries.length, results.length);
    const queryBlocks: Query[] = []
    for (let i = 0; i < numQueries; i++) {
        // Your logic here
        console.log(i);
        queryBlocks.push({
          description: descs[i],
          query: queries[i],
          result: results[i]
        })
    }
    setQueries(queryBlocks)
  } else {
    throw new Error('desc, query, or result are not arrays');
  }
},
});
  const prevMessagesLengthRef = useRef(messages.length);

  const handleMessageSubmit = async (e: FormEvent<HTMLFormElement>) => {
    console.log('handle submit code run')
    e.preventDefault();
    handleSubmit(e);
    setContext(null);
    setGotMessages(false);
  };

  // useEffect(() => {
  //   const getQuery = async () => {
  //     console.log('test test test test')
  //   }

  //     getQuery();
  // }, [messages])

  return (
    <div className="flex flex-col justify-between h-screen bg-gray-800 p-2 mx-auto max-w-full">
      <Header className="my-5" />

      <button
        onClick={() => setModalOpen(true)}
        className="fixed right-4 top-4 md:right-6 md:top-6 text-xl text-white animate-pulse-once info-button"
      >
        <AiOutlineInfoCircle />
      </button>

      <InstructionModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />

      <div className="flex w-full flex-grow overflow-hidden relative">
        <Chat
          input={input}
          handleInputChange={handleInputChange}
          handleMessageSubmit={handleMessageSubmit}
          messages={messages}
        />
        <div className="absolute transform translate-x-full transition-transform duration-500 ease-in-out right-0 w-2/3 h-full bg-gray-700 overflow-y-auto lg:static lg:translate-x-0 lg:w-2/5 lg:mx-2 rounded-lg">
          
          <div
      className={`flex flex-col border-2 overflow-y-auto rounded-lg border-gray-500 w-full`}
    >
      <div className="flex flex-col items-start sticky top-0 w-full">
        { !gotMessages && <GraphAnimation /> }
        { gotMessages && queries.map((q) => <Query key={q.query} query={q.query} description={q.description} result={q.result} />)}
      </div>
      </div>

        </div>
        <button
          type="button"
          className="absolute left-20 transform -translate-x-12 bg-gray-800 text-white rounded-l py-2 px-4 lg:hidden"
          onClick={(e) => {
            e.currentTarget.parentElement
              ?.querySelector(".transform")
              ?.classList.toggle("translate-x-full");
          }}
        >
          ☰
        </button>
      </div>
    </div>
  );
};

export default Page;
