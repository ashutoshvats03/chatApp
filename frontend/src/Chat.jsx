import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Connect to the backend
const socket = io('http://localhost:5000');

const Chat = () => {
  const [name, setName] = useState(''); // Store user name
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [hasSetName, setHasSetName] = useState(false); // Track if the user has set their name

  useEffect(() => {
    // Listen for incoming messages
    localStorage.setItem('messages', JSON.stringify(messages));
    socket.on('chat message', (msgObj) => {
      setMessages((messages) => [...messages, msgObj]);
    });
    return () => {
      socket.off('chat message');
    };
  }, []);

  const handleSetName = (e) => {
    e.preventDefault();
    if (name.trim()) {
      socket.emit('setName', name); // Send the name to the server
      setHasSetName(true); // Mark that the name is set
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('chat message', message); // Send message to server
      setMessage('');
    }
  };

  return (
    <div className='bg-slate-900 w-full h-screen relative'>
      {!hasSetName ? (
        <form className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ' onSubmit={handleSetName}>
          <input
            className='rounded-sm bg-slate-600 p-3 text-xl'
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
          <button type="submit"></button>
        </form>
      ) : (
        <div className='flex'>
          <div className='w-1/4 h-full'>
            <div className=' text-white  font-bold ml-10 my-5'>
              <div className=' text-3xl mb-8'>Online</div>
              {messages
                .map(msgObj => msgObj.name) // Extract names from messages
                .filter((name, index, self) => self.indexOf(name) === index) // Filter to keep unique names
                .map((uniqueName, index) => (
                  <div className='text-2xl ml-5 mt-2  ' key={index}>
                    {uniqueName}
                  </div>
                ))}
            </div>

          </div>
          <div>
            <ul className='absolute bg-slate-500 w-3/4 h-full px-5 font-bold text-xl pt-5'>
              {messages.map((msgObj, index) => (
                <div className='relative w-full'>
                  {msgObj.id === socket.id ?
                    <li className='  mb-2 text-right' key={index}>
                      {msgObj.msg}
                    </li> :
                    <li className='  mb-2 text-left' key={index}>
                      {msgObj.name + ': '}
                      {msgObj.msg}
                    </li>}
                </div>
              ))}
            </ul>
            <form onSubmit={sendMessage}>
              <input
                className='rounded-sm bg-slate-600 p-3 text-xl bottom-0 absolute w-3/4 my-2'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
