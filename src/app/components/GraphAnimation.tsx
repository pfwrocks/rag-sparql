import autoAnimate from '@formkit/auto-animate';
import { useEffect, useRef, useState } from 'react';

function AnimatedGraph() {
  const parentRef = useRef(null);
  const [currentSVG, setCurrentSVG] = useState(0);
  
  useEffect(() => {
    const parentElement = parentRef.current;
    parentElement && autoAnimate(parentElement);
    
    const intervalId = setInterval(() => {
      setCurrentSVG((prevSVG) => (prevSVG + 1) % 3);  // Cycle through 3 SVGs
    }, 2000);  // Adjust the interval as needed

    return () => clearInterval(intervalId);  // Clean up interval on unmount
  }, []);

  return (
    <div className="text-left w-full flex flex-col rounded-b-lg bg-gray-600 p-3 subpixel-antialiased">
          <div ref={parentRef} className="flex justify-center">
            {currentSVG === 0 && 
            <svg className="text-blue-500" width="200" height="150" xmlns="http://www.w3.org/2000/svg" fill="currentcolor">
              <line x1="50" y1="50" x2="150" y2="50" stroke="black" strokeWidth="2" />                
              <line x1="50" y1="50" x2="100" y2="120" stroke="black" strokeWidth="2" />
              <line x1="50" y1="50" x2="30" y2="120" stroke="black" strokeWidth="2" />
              <line x1="50" y1="50" x2="130" y2="20" stroke="black" strokeWidth="2" />
              <circle cx="50" cy="50" r="10" />
              <circle cx="150" cy="50" r="10" />
              <circle cx="100" cy="120" r="10" />
              <circle cx="30" cy="120" r="10" />
              <circle cx="130" cy="20" r="10" />
            </svg>}
            {currentSVG === 1 && 
              <svg className="text-red-500" width="200" height="150" xmlns="http://www.w3.org/2000/svg" fill="currentcolor">
                <line x1="70" y1="70" x2="130" y2="70" stroke="black" strokeWidth="2" />
                <line x1="70" y1="70" x2="100" y2="100" stroke="black" strokeWidth="2" />
                <line x1="70" y1="70" x2="50" y2="100" stroke="black" strokeWidth="2" />
                <line x1="70" y1="70" x2="100" y2="40" stroke="black" strokeWidth="2" />
                <circle cx="70" cy="70" r="10" />
                <circle cx="130" cy="70" r="10" />
                <circle cx="100" cy="100" r="10" />
                <circle cx="50" cy="100" r="10" />
                <circle cx="100" cy="40" r="10" />
            </svg>
            }
            {currentSVG === 2 && 
            <svg className="text-green-500" width="200" height="150" xmlns="http://www.w3.org/2000/svg" fill="currentcolor">
              <line x1="50" y1="30" x2="150" y2="30" stroke="black" strokeWidth="2" />                
              <line x1="50" y1="30" x2="100" y2="100" stroke="black" strokeWidth="2" />
              <line x1="50" y1="30" x2="30" y2="100" stroke="black" strokeWidth="2" />
              <line x1="150" y1="30" x2="170" y2="100" stroke="black" strokeWidth="2" />
              <circle cx="50" cy="30" r="10" />
              <circle cx="150" cy="30" r="10" />
              <circle cx="100" cy="100" r="10" />
              <circle cx="30" cy="100" r="10" />
              <circle cx="170" cy="100" r="10" />
            </svg>

            }
          </div>
          <p className="text-center text-lg text-zinc-100 mb-4">Searching...</p>
        </div>
  );
}

export default AnimatedGraph;
