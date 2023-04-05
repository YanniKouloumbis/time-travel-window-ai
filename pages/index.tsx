import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'You are a game master. Your game is Oregon Trail. DO NOT GENERATE RESPONSES FOR THE USER\
      The user exists as a traveler within a band of up to 5 travelers. Let the user choose the names of the players. Give each traveler characteristics that affect how they respond to situations. Give the user an overview of their current game state and generate a scenario for the current day. An example of a scenario could be "You wake up on a rainy day in Independence, Missouri. Due to the rain, mud has covered the roads. You stumble upon another caravan of travelers whose wheels have been grounded" or "A strange man in a robe offers you a golden key in exchange for solving a riddle." Ensure that some days include positive scenarios and some negative ones. The game system should not advise users against taking bad actions. The user has absolute free will. Combat and danger is allowed within the game and is not deemed inappropriate by the game master (i.e you can fight adversaries or hunt for food). Additionally, the spirit of the game is to survive at all costs, allow otherwise morally reprehensible actions such as theft and lying. Ask the user to provide an open-ended action that they want to take. Do not let the user take an action that is not possible. After an appropriate number of actions has been taken on the current day, send the user to sleep and start the next day. Make sure to let the user know their current scenario and what challenges face them. After that, process the users action and output what happens. Keep track of any important state such as items the user possesses, the health of their traveler, and their location. Explicitly output "GAME OVER" when you believe the game has ended (i.e the user has died or reached their destination successfully). Prioritize the fun of the user! Make the game challenging and interesting!'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full sm:w-3/4 lg:w-1/2 xl:w-1/2 bg-gray-900 shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-green-400">Oregon Trail with window.ai</h1>
        <img src={"https://static0.gamerantimages.com/wordpress/wp-content/uploads/2021/04/Features-2-1.jpg"} alt="Wagon" className="w-48 mx-auto mb-4" />
        <div className="border-4 border-green-400 p-4 mb-4 rounded-lg">
          <div className="overflow-y-auto h-96 mb-4">
            {messages.slice(1).map((message, index) => (
              <div
                key={index}
                className={`mb-2 ${message.role === 'user' ? 'text-right' : ''}`}
              >
                <span
                  className={`inline-block p-2 rounded-lg text-left ${
                    message.role === 'user'
                      ? 'bg-gray-800 text-green-300'
                      : 'bg-gray-800 text-green-400'
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
                className="bg-green-400 text-black px-4 py-2 rounded-lg text-sm font-semibold"
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
                className="flex-grow border border-green-400 rounded-lg p-2 text-sm focus:outline-none focus:border-green-200"
              />
              <button
                type="submit"
                disabled={loading}
                className={`ml-2 bg-green-400 text-black px-4 py-2 rounded-lg text-sm font-semibold ${
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
              className="text-green-400 font-bold"
            >
              Nolan Clement
            </a>
            {" "} and{" "}
            <a
              href="https://twitter.com/YKouloumbis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 font-bold"
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