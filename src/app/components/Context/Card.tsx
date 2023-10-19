import React, { FC } from "react";
import ReactMarkdown from "react-markdown";

export interface ICard {
  query: string;
  description: string;
  result: string;
}

interface ICardProps {
  card: ICard;
  selected: string[] | null;
}

export const Card: FC<ICardProps> = ({ card, selected }) => (
  <div
    id={card.query}
    className={`card w-full p-5 m-2 text-white ${
      selected && selected.includes(card.query)
        ? "bg-gray-600"
        : "bg-gray-800"
    } ${
      selected && selected.includes(card.query)
        ? "border-double border-4 border-sky-500"
        : "opacity-60 hover:opacity-80 transition-opacity duration-300 ease-in-out"
    }`}
  >
    <ReactMarkdown>SPARQL Query:</ReactMarkdown>
    <p className="text-md text-blue-400">{card.query}</p>
    <br/>
    <ReactMarkdown># Description:</ReactMarkdown>
    <p className="text-md text-blue-400">{card.description}</p>
    <br/>
    <ReactMarkdown># Result:</ReactMarkdown>
    <p className="text-md text-blue-400">{card.result}</p>
  </div>
);
