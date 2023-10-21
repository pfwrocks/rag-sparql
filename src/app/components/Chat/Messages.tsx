import { Message } from "ai";
import { useRef } from "react";
import {RiRobot2Line, RiUserFill} from "react-icons/ri"
import Image from 'next/image'

export default function Messages({ messages }: { messages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const extractImageUrls = (text: string) => {
    const regex = /https:\/\/(?:image\.tmdb\.org|www\.hungrypaprikas\.com|www\.skinnytaste\.com|www\.restlesschipotle\.com|www\.allrecipes\.com|www\.theclevercarrot\.com|platedcravings\.com)\/.*?\.jpg/g;
    return text.match(regex);
  };

  return (
    <div className="border-2 border-gray-600 p-6 rounded-lg overflow-y-scroll flex-grow flex flex-col bg-gray-700">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`${
            msg.role === "assistant" ? "text-green-300" : "text-blue-300"
          } my-2 p-3 rounded shadow-md hover:shadow-lg transition-shadow duration-200 flex slide-in-bottom bg-gray-800 border border-gray-600 message-glow`}
        >
          <div className="rounded-tl-lg bg-gray-800 p-2 border-r border-gray-600 flex items-center">
            {msg.role === "assistant" ? <RiRobot2Line /> : <RiUserFill />}
          </div>
          <div className="m1-2">
          <div className="ml-2 flex items-center text-gray-200">
            {msg.content}
          </div>
          {msg.role === "assistant" && 
              <div className="mt-2 flex">
                {extractImageUrls(msg.content)?.slice(0, 6).map((url, imgIndex) => (
                  <div key={imgIndex} className="ml-2">
                    <Image src={url} width={200} height={200} alt="Image from content"/>
                  </div>
                ))}
              </div>
          }
          
        </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
