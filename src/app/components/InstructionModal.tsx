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
      <div className="bg-gray-400 p-5 z-50 rounded-lg shadow-lg relative w-8/12 md:w-5/12">
        <button
          onClick={onClose}
          className="absolute right-2 text-3xl top-2 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">Instructions</h2>
        <p>
          This chatbot uses SPARQL for RAG. For this demo we have loaded some sample user data that you can query across. All data that apps will generate on the datacrate.io platform will be in formats queriable by SPARQL. As you ask questions, if the answer will be made from user data, the queries made in order to get your answer will be displayed on the right panel (on mobile, open the
          context panel by clicking the button at the top left of the message
          panel). Click on the blue link icons to open the TRTL file in a new window.
        </p>
        <br />
        <p>
          Examples of the types of data loaded for this demo:
        </p>
        <ul>
          <li>- Movies (With various metadata about the movies as well as when the user watched them or added them to their list)</li>
          <li>- Chat (This includes three different fake chat threads between different fictional characters)</li>
          <li>- Recipes (This includes a list of recipes as well as the ingredients and instructions for each recipe)</li>
          <li>- and Calendar (This includes various calendar events that the ficticious user has added to their calendar)</li>
        </ul>
        <br />
        <p>
          No markdown splitting, no recursive text splitting, the model just queries
          exactly what it needs. If it is unclear, the model can generate generic queries
          before running more precise ones.
        </p>
        <br />
      </div>
      <div
        className="absolute inset-0 bg-black z-20 opacity-50"
        onClick={onClose}
      ></div>
    </div>
  );
};

export default InstructionModal;
