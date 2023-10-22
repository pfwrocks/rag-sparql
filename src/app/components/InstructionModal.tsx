import React from "react";

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstructionModal: React.FC<InstructionModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="bg-gray-400 p-5 z-50 rounded-lg shadow-lg relative w-8/12 md:w-5/12 max-h-[70vh] overflow-y-auto space-y-4">
        <button
            onClick={onClose}
            className="absolute right-2 top-2 text-3xl text-gray-500 hover:text-gray-700"
        >
            &times;
        </button>
        <h2 className="text-2xl font-semibold mb-2">Instructions</h2>
        <p className="text-gray-700 leading-relaxed">
            Welcome to our chatbot demo that integrates SPARQL for RAG. You`ll have the opportunity to query sample user data stored on the datacrate.io platform. The unique aspect of our demo is the transparency in how answers are formulated using SPARQL queries.
        </p>

        <h3 className="text-xl font-semibold">How to Use:</h3>
        <p className="text-gray-700 leading-relaxed">
            Begin by asking a question related to the sample data we`ve loaded. As the chatbot responds, any SPARQL queries used to fetch the answer will be showcased on the right panel. If you`re on a mobile device, access this context panel by tapping the button at the top left of the message panel.
        </p>

        <h3 className="text-xl font-semibold">Sample Data Types Available:</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Movies: Data related to various films, inclusive of metadata, watch history, and user lists.</li>
            <li>Chat: Explore chat threads between imaginary characters.</li>
            <li>Recipes: Dive into a list of recipes detailing ingredients and step-by-step instructions.</li>
            <li>Calendar: Browse through assorted calendar events added by our fictitious user.</li>
        </ul>

        <h3 className="text-xl font-semibold">Important Notes:</h3>
        <p className="text-gray-700 leading-relaxed">
            The model retrieves data directly without unnecessary complications. It fetches precisely what it requires based on your query. In cases of ambiguity, the model might opt to produce a generic query first, refining it for more accurate results subsequently. Give it a try and explore the power of SPARQL in this chatbot interface!
        </p>
    </div>
    <div
        className="absolute inset-0 bg-black z-20 opacity-50"
        onClick={onClose}
    ></div>
</div>


  );
};

export default InstructionModal;
