import React, { useEffect, useState } from "react";
import { Card, ICard } from "./Card";
import UrlButton from "./UrlButton";
import { urls } from "./urls";
import { crawlDocument } from "./utils";

interface ContextProps {
  className: string;
  selected: string[] | null;
  //cards: ICard[];
}

export const Context: React.FC<ContextProps> = ({ className, selected }) => {
  const [entries, setEntries] = useState(urls);
  const [cards, setCards] = useState<ICard[]>([]);

  const [splittingMethod, setSplittingMethod] = useState("markdown");
  const [chunkSize, setChunkSize] = useState(256);
  const [overlap, setOverlap] = useState(1);

  // Scroll to selected card
  useEffect(() => {
    const element = selected && document.getElementById(selected[0]);
    element?.scrollIntoView({ behavior: "smooth" });
  }, [selected]);

  const DropdownLabel: React.FC<
    React.PropsWithChildren<{ htmlFor: string }>
  > = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="text-white p-2 font-bold">
      {children}
    </label>
  );

  const buttons = entries.map((entry, key) => (
    <div className="" key={`${key}-${entry.loading}`}>
      <UrlButton
        entry={entry}
        onClick={() =>
          crawlDocument(
            entry.url,
            setEntries,
            setCards,
            splittingMethod,
            chunkSize,
            overlap
          )
        }
      />
    </div>
  ));

  // set example cards with data
  useEffect(() => {
    setCards([
      {
        query: `PREFIX schem: <https://schema.org/> SELECT ?movie WHERE { ?movie schem:description ?description . FILTER(CONTAINS(?description, 'space') || CONTAINS(?description, 'galaxy') || CONTAINS(?description, 'stars')) } LIMIT 15`,
        description: `This query retrieves movies that have a description related to space, galaxy, or stars.`,
        result: `{"head":{"vars":["movie"]},"results":{"bindings":[{"movie":{"type":"uri","value":"file:///staging/movies/walle-2008.ttl#it"}},{"movie":{"type":"uri","value":"file:///staging/movies/alien-1979.ttl#it"}},{"movie":{"type":"uri","value":"file:///staging/movies/interstellar-2014.ttl#it"}}]}}`
      },
      {
        query: `PREFIX schem: <https://schema.org/> SELECT ?movie ?datePublished WHERE { ?movie schem:datePublished ?datePublished } LIMIT 1`,
        description: `This query retrieves the datePublished of the oldest movie in the dataset.`,
        result: `{"head":{"vars":["movie","datePublished"]},"results":{"bindings":[{"movie":{"type":"uri","value":"file:///staging/movies/city-lights-1931.ttl#it"},"datePublished":{"type":"literal","datatype":"http://www.w3.org/2001/XMLSchema#dateTime","value":"1931-02-01T00:00:00Z"}}]}}`
      }
    ]);
  }
  ,[])

  return (
    <div
      className={`flex flex-col border-2 overflow-y-auto rounded-lg border-gray-500 w-full ${className}`}
    >
      <div className="flex flex-col items-start sticky top-0 w-full">
        {/*<div className="flex flex-col items-start lg:flex-row w-full lg:flex-wrap p-2 justify-center">
          {buttons}
        </div>
        <div className="flex-grow w-full px-4">
          <Button
            className="w-full my-2 uppercase active:scale-[98%] transition-transform duration-100"
            style={{
              backgroundColor: "#4f6574",
              color: "white",
            }}
            onClick={() => clearIndex(setEntries, setCards)}
          >
            Clear Index
          </Button>
        </div>
        <div className="flex p-2"></div>*/}
        <div className="text-left w-full flex flex-col rounded-b-lg bg-gray-600 p-3 subpixel-antialiased">
          {/* <DropdownLabel htmlFor="splittingMethod">
            Splitting Method:
          </DropdownLabel> */}
          {/* <div className="relative w-full">
            <select
              id="splittingMethod"
              value={splittingMethod}
              className="p-2 bg-gray-700 rounded text-white w-full appearance-none hover:cursor-pointer"
              onChange={(e) => setSplittingMethod(e.target.value)}
            >
              <option value="recursive">Recursive Text Splitting</option>
              <option value="markdown">Markdown Splitting</option>
            </select>
          </div> */}
          {/* {splittingMethod === "recursive" && (
            <div className="my-4 flex flex-col">
              <div className="flex flex-col w-full">
                <DropdownLabel htmlFor="chunkSize">
                  Chunk Size: {chunkSize}
                </DropdownLabel>
                <input
                  className="p-2 bg-gray-700"
                  type="range"
                  id="chunkSize"
                  min={1}
                  max={2048}
                  onChange={(e) => setChunkSize(parseInt(e.target.value))}
                />
              </div>
              <div className="flex flex-col w-full">
                <DropdownLabel htmlFor="overlap">
                  Overlap: {overlap}
                </DropdownLabel>
                <input
                  className="p-2 bg-gray-700"
                  type="range"
                  id="overlap"
                  min={1}
                  max={200}
                  onChange={(e) => setOverlap(parseInt(e.target.value))}
                />
              </div>
            </div>
          )} */}
          <p className="text-center text-lg text-zinc-100 mb-4">Data Searched Over</p>
          <div className="flex justify-center text-blue-500">
            <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg" fill="currentcolor">
              <line x1="50" y1="50" x2="150" y2="50" stroke="black" strokeWidth="2" />                
              <line x1="50" y1="50" x2="100" y2="120" stroke="black" strokeWidth="2" />
              <line x1="50" y1="50" x2="30" y2="120" stroke="black" strokeWidth="2" />
              <line x1="50" y1="50" x2="130" y2="20" stroke="black" strokeWidth="2" />
              <circle cx="50" cy="50" r="10" />
              <circle cx="150" cy="50" r="10" />
              <circle cx="100" cy="120" r="10" />
              <circle cx="30" cy="120" r="10" />
              <circle cx="130" cy="20" r="10" />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap w-full">
        {cards &&
          cards.map((card, key) => (
            <Card key={key} card={card} selected={selected} />
          ))}
      </div>
    </div>
  );
};
