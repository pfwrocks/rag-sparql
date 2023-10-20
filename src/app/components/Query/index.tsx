import ReactMarkdown from "react-markdown";

export interface Query {
    description: string;
    query: string;
    result: string
}

export const Query: React.FC<Query> = ({ description, query, result }) => {
    return (
        <div 
            id={query}
            className="card w-full p-5 m-2 text-white bg-gray-600 border-double border-4 border-sky-500"
        >
            <ReactMarkdown>SPARQL Query:</ReactMarkdown>
            <p className="text-md text-blue-400">{query}</p>
            <br/>
            <ReactMarkdown># Description:</ReactMarkdown>
            <p className="text-md text-blue-400">{description}</p>
            <br/>
            <ReactMarkdown># Result:</ReactMarkdown>
            <p className="text-md text-blue-400">{result}</p>
        </div>
    )
}