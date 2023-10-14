import React from "react";
import { AiFillGithub } from "react-icons/ai";

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
          This chatbot uses RDF for RAG. In the context panel on the right, you can
          see some sources you can index on (on mobile, open the
          context panel by clicking the button at the top left of the message
          panel). Click on the blue link icons to open the TRTL file in a new window.
        </p>
        <br />
        <p>
          After selecting from the sources, you can ask the chatbot questions about the
          data. The chatbot will run queries against these sources to pull relevant data.
        </p>
        <br />
        <p>
          No markdown splitting, no recursive text splitting, the model just queries
          exactly what it needs. If it is unclear, the model can generate generic queries
          before running more precise ones.
        </p>
        <br />
        <p>
          You can clear the index by clicking the <span className="bg-zinc-600 text-zinc-100 px-1 py-1 rounded">Clear Index</span> button
          in the context panel.
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
