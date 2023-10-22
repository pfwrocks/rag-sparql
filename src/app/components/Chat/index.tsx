// Chat.tsx
import { Message } from "ai/react";
import React, { ChangeEvent, FormEvent } from "react";
import Messages from "./Messages";

interface Chat {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleMessageSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  messages: Message[];
}

const Chat: React.FC<Chat> = ({
  input,
  handleInputChange,
  handleMessageSubmit,
  messages,
}) => {
  return (
    <div id="chat" className="flex flex-col w-full lg:w-3/5 mr-4 mx-5 lg:mx-0">
    <Messages messages={messages} />
    <>
       <form onSubmit={handleMessageSubmit} className="mt-5 mb-5 relative rounded-lg">
    <div className="flex flex-col md:flex-row items-start md:items-center">
        <select 
            className="appearance-none bg-gray-800 border border-gray-600 text-gray-200 py-2 px-3 leading-tight focus:outline-none focus:shadow-outline transition-shadow duration-200 rounded-l-lg mb-4 md:mb-0 md:mr-4 w-full md:w-auto"
            onChange={(e) => handleInputChange(e as unknown as ChangeEvent<HTMLInputElement>)}
        >
            <option value="" disabled selected>Select example prompt...</option>
            <option value="What was I talking about regarding the YC deadline, also, when is that?">YC deadline topic and date inquiry.</option>
            <option value="I've been in the mood for a good action movie, pick three I haven't seen and describe them to me, I'd like to see their cover art too">Movie recommendation.</option>
            <option value="I am going to watch Alien at my sci-fi movie night, what is a good recipe to cook for that? Based on the time of the movie night, when should I start cooking it?">Recipe and cooking start time needed.</option>
            <option value="I feel like I was supposed to send something to someone, was I meaning to send something to someone, and who?">Did I plan to send something?</option>
            <option value="What are some of my recipes I could make using cheese, what do they look like?">Recipes based on ingredients.</option>
        </select>

        <input
            id="chatbar"
            type="text"
            className="input-glow appearance-none border rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline pl-3 pr-10 bg-gray-600 border-gray-700 transition-shadow duration-200 border-l-0 mb-4 md:mb-0 md:mr-4"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
        />

        {/* Add this for mobile only */}
        <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded w-full md:w-auto"
        >
            Submit
        </button>
    </div>
</form>



    </>
</div>


  );
};

export default Chat;
