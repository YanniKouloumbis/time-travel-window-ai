import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'You are a game master. Your game is Time Travel Adventure. DO NOT GENERATE RESPONSES FOR THE USER\
      The user exists as a time traveler who can choose a year to visit. Let the user select the year they want to travel to. Give the user an overview of their current game state and generate a scenario for the current day based on the chosen year. An example of a scenario could be "You arrive in the year 1920, during the roaring twenties. You find yourself in a bustling city with people dressed in flappers and suits, enjoying the nightlife" or "You land in the year 1969, witnessing the first Moon landing on a small television in a crowded room." Ensure that some days include positive scenarios and some negative ones. The game system should not advise users against taking bad actions. The user has absolute free will. Combat, danger, and morally ambiguous actions are allowed within the game. Ask the user to provide an open-ended action that they want to take. Do not let the user take an action that is not possible. After an appropriate number of actions has been taken on the current day, send the user to sleep and start the next day. Make sure to let the user know their current scenario and what challenges face them. After that, process the users action and output what happens. Keep track of any important state such as items the user possesses, the health of their traveler, and their location in time. Explicitly output "GAME OVER" when you believe the game has ended (i.e the user has died or successfully completed their mission). Prioritize the fun of the user! Make the game challenging and interesting!'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!inputValue) return;

    const newMessage = { role: 'user', content: inputValue };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue('');

    // Show loading state while waiting for the AI to respond
    setLoading(true);

    // Keep track of the updated messages array
    let updatedMessages = [...messages, newMessage];

    const streamingOptions = {
      temperature: 1,
      maxTokens: 1000,
      onStreamResult: (result, error) => {
        if (error) {
          console.error(error);
          setLoading(false);
        } else if (result) {
          setLoading(false);

          // Process the AI assistant's response
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          if (lastMessage.role === 'user') {
            setLoading(false);
            updatedMessages = [
              ...updatedMessages,
              {
                role: 'assistant',
                content: result.message.content,
              },
            ];
          } else {
            updatedMessages = updatedMessages.map((message, index) => {
              if (index === updatedMessages.length - 1) {
                return {
                  ...message,
                  content: message.content + result.message.content,
                };
              }
              return message;
            });
          }

          // Update the messages state
          setMessages(updatedMessages);
        }
      },
    };
    // Call the AI with the current messages and streaming options
    if (window?.ai) {
      try {
        await window.ai.getCompletion(
          { messages: [{ role: 'system', content: 'You are a helpful assistant.' }, ...messages, newMessage] },
          streamingOptions
        );
      } catch (e) {
        setLoading(false);
        console.error(e);
      }
    } else {
      setLoading(false);
      setPopupVisible(true);
    }
  };
  useEffect(() => {
  if(inputValue === "Let's start the game!") {
    handleSendMessage({preventDefault: () => {}});
  }
}, [inputValue]);

const startGame = () => {
setInputValue("Let's start the game!");
};

const scrollToBottom = () => {
messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

useEffect(() => {
scrollToBottom();
}, [messages]);

return (
<div className="min-h-screen flex items-center justify-center bg-gray-900">
  {popupVisible && (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 p-6 rounded-lg">
        <p className="text-white mb-4">
          It looks like window.ai is not available. Please make sure you have visited <a>windowai.io</a> and correctly configured the extension.
        </p>
        <button
          onClick={() => setPopupVisible(false)}
          className="bg-blue-400 text-black px-4 py-2 rounded-lg text-sm font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  )}
  <div className="w-full sm:w-3/4 lg:w-1/2 xl:w-1/2 bg-gray-800 shadow-lg rounded-lg p-6">
    <h1 className="text-3xl font-bold text-blue-400">Time Traveler</h1>
    <img src={"https://media.istockphoto.com/id/1129640969/photo/time-traveler-holds-a-clock-and-stands-in-front-of-a-portal-ready-get-teleported-to-another.jpg?s=612x612&w=0&k=20&c=4_ZQaFNSOT4Ob4FjDe9J4xvBNhjeXWICIsgLTxz9VkA="} alt="Time Traveler" className="w-48 mx-auto mb-4" />
    <div className="border-4 border-blue-400 p-4 mb-4 rounded-lg">
      <div className="overflow-y-auto h-96 mb-4">
        {messages.slice(1).map((message, index) => (
          <div
            key={index}
            className={`mb-2 ${message.role === 'user' ? 'text-right' : ''}`}
          >
            <span
              className={`inline-block p-2 rounded-lg text-left ${
                message.role === 'user'
                  ? 'bg-gray-700 text-blue-300'
                  : 'bg-gray-700 text-blue-400'
              }`}
            >
              {message.content}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>
      {messages.length === 1 ? (
        <div className="flex justify-center">
          <button
            onClick={startGame}
            className="bg-blue-400 text-black px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Start Game
          </button>
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow border border-blue-400 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-200"
          />
          <button
            type="submit"
            disabled={loading}
            className={`ml-2 bg-blue-400 text-black px-4 py-2 rounded-lg text-sm font-semibold ${
              loading ? 'opacity-50' : ''
            }`}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      )}
    </div>
    <div className="text-center">
      <p className="text-sm text-gray-300">
        Created by{" "}
        <a
          href="https://twitter.com/nolangclement"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 font-bold"
        >
          Nolan Clement
        </a>
        {" "} and{" "}
        <a
          href="https://twitter.com/YKouloumbis"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 font-bold"
        >
          Yanni Kouloumbis
        </a>
        
        
      </p>
    </div>
  </div>
</div>
);
};

export default App;