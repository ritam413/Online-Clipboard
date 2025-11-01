'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ClipboardItem } from './components/clipboard';
import { InputTabs } from './components/inputTab';
import { RetrieveItem } from './components/retrieve';
import { socket } from './testweb/client';
// --- Main App Component ---
function App() {
  const [items, setItems] = useState([]);
  const [wsStatus, setWsStatus] = useState('Connecting...');
  // const ws = useRef(null); // WebSocket ref
  const [sockets, setSocket] = useState(null)
  const [text, setText] = useState("")
  const [roomCode, setRoomcode] = useState('')
  const [Recieved, setRecieved] = useState([])
  const [retrieveCode, setRetrieveCode] = useState('')
  const [retrievalStatus, setRetrievalStatus] = useState('true')
  // --- NEW State for UI Mode ---
  const [mode, setMode] = useState('send'); // 'send' or 'retrieve'


  // --- Mock WebSocket Connection ---
  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on('connect', () => {
      setWsStatus('Connected');
      console.log('Connected 🏠:', socket.id);
    });

    socket.on('previous-messages', (oldMessages) => {
      console.log("Message Recieved: ", oldMessages);
      const normalized = Array.isArray(oldMessages) ? oldMessages : [oldMessages];
      setItems(normalized);
    });

    socket.on('message', (msg) => {
      console.log("📨 New message:", msg);
      setItems((prev) => [msg, ...prev]);
    });

    return () => {
      socket.off('connect');
      socket.off('previous-messages');
      socket.off('message');
    };
  }, []);



  // --- WebSocket Message Handlers ---
  const addItemToFeed = (item) => {
    // Add item to the top of the list
    setItems((prevItems) => [item, ...prevItems]);
  };



  // --- Content Handlers ---
  const handleSendText = () => {
    const message = text
    socket.emit('create-room', (code) => {
      setRoomcode(code)
      console.log("Room Created: ✅ ", code)

      // Send message to that room
      socket.emit('message', { code: code, message: message })

    })
  };

  // const handleSendFile = (file, type) => {
  //   setRetrievalStatus({ message: '', error: false }); // Clear status

  //   // --- Logic to be implemented ---
  //   // 1. Upload the `file` to your server (e.g., via fetch POST, not WebSocket).
  //   // 2. On successful upload, get a file URL.
  //   // 3. Send this file URL, file name, and type to your WebSocket server.
  //   //    e.g., ws.current.send(JSON.stringify({ type: 'sendFile', payload: { url, name, type } }));
  //   // 4. Your server generates a code and sends it back.
  //   // 5. In your ws.onmessage handler, catch the code (same as handleSendText).
  //   // --- End of logic placeholder ---

  //   // Simulating the result for UI demo
  //   console.log("Sending file:", file.name, type);
  //   const code = generateCode(); // Placeholder
  //   const fileUrl = URL.createObjectURL(file);
  //   const newItem = {
  //     id: Date.now(),
  //     type: type,
  //     url: fileUrl,
  //     name: file.name,
  //     source: 'This Device',
  //     code: code, // Add the code directly to the item
  //   };
  //   addItemToFeed(newItem);
  //   // --- REMOVED: setGeneratedCode(generateCode());
  //   // --- REMOVED: setShowCodeModal(true);
  // };

  // --- New Handler: Retrieve Item by Code ---
  const handleRetrieve = (inputCode) => {
    const retriCode = retrieveCode

    socket.emit('join-room', { code: retriCode })

    socket.once('room-joined', (code) => {
      console.log("Room Joined: ✅ ", code)
    })
  };

  // --- Copy-to-Clipboard ---
  // ... (function remains unchanged) ...
  // const handleCopyText = (text) => {
  //   if (copyTextAreaRef.current) {
  //     copyTextAreaRef.current.value = text;
  //     copyTextAreaRef.current.select();
  //     try {
  //       document.execCommand('copy');
  //       console.log('Text copied to clipboard');
  //       // Add a small notification if desired
  //     } catch (err) {
  //       console.error('Failed to copy text: ', err);
  //     }
  //     copyTextAreaRef.current.blur();
  //   }
  // };

  const handleChange = (e) => {
    setText(e.target.value)
  }
  const handleRetrieveChange = (e) => {
    setRetrieveCode(e.target.value)
  }

  return (
    <div className="flex h-screen w-full flex-col bg-gray-900 font-sans text-gray-100">
      {/* Hidden textarea for copy-paste */}
      <textarea
        // ref={}
        tabIndex="-1"
        aria-hidden="true"
        className="absolute -left-[9999px] top-0"
      />

      {/* --- REMOVED: Code Modal --- */}
      {/* {showCodeModal && ... } */}

      {/* Header */}
      <header className="navbar sticky top-0 z-10 w-full flex-none bg-gray-800 shadow-md">
        <div className="flex-1">
          <a className="btn-ghost btn text-xl font-bold text-white">
            Klipboard
          </a>
        </div>
        <div className="flex-none">
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-400">{wsStatus}</span>
            <span
              className={`h-3 w-3 rounded-full ${wsStatus === 'Connected' ? 'bg-green-500' : 'bg-yellow-500'
                }`}
            ></span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="flex h-full flex-col md:flex-row">

          {/* Input Panel */}
          <div className="w-full shrink-0 p-4 shadow-lg md:w-80 lg:w-96">
            {/* --- NEW: Mode Toggle Tabs --- */}
            <div className="tabs tabs-boxed flex rounded-b-none bg-gray-700">
              <button
                className={`tab-lg tab flex-1 ${mode === 'send' ? 'tab-active !bg-gray-800' : 'text-gray-400'}`}
                onClick={() => setMode('send')}
              >
                Send
              </button>
              <button
                className={`tab-lg tab flex-1 ${mode === 'retrieve' ? 'tab-active !bg-gray-800' : 'text-gray-400'}`}
                onClick={() => setMode('retrieve')}
              >
                Retrieve
              </button>
            </div>

            {/* --- NEW: Conditional Panel Content --- */}
            {mode === 'send' && (
              <InputTabs
                onSendText={handleSendText}
              // onSendFile={handleSendFile}
              />
            )}

            {mode === 'retrieve' && (
              <RetrieveItem
                onRetrieve={handleRetrieve}
                status={retrievalStatus}
                onClose={() => setMode('send')}
              />
            )}
          </div>

          {/* Feed Panel */}
          <div className="flex-1 overflow-y-auto bg-gray-900 p-4">
            <div className="mx-auto max-w-2xl">
              <h2 className="mb-4 text-lg font-semibold text-gray-300">
                Clipboard Feed
              </h2>
              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700 text-gray-500">
                    <p>Your clipboard is empty.</p>
                    <p>Retrieve an item to get started!</p>
                  </div>
                ) : (
                  items.map((item, index) => (
                    <ClipboardItem
                      key={item.id || index}
                      item={item}
                      // onCopyText={handleCopyText}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;

