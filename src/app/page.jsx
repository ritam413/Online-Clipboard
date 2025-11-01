'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Send, Clipboard, Check, ArrowRight, Inbox } from 'lucide-react'

// --- REFACTORED MOCK SOCKET (Room isolation) ---
const createMockSocket = () => {
  const listeners = new Map()
  let rooms = {} // { ROOMCODE: [ {message: "..."} ] }

  const on = (event, callback) => {
    if (!listeners.has(event)) listeners.set(event, [])
    listeners.get(event).push(callback)
  }

  const off = (event, callback) => {
    if (listeners.has(event)) {
      const arr = listeners.get(event)
      const index = arr.indexOf(callback)
      if (index > -1) arr.splice(index, 1)
    }
  }

  const once = (event, callback) => {
    const oneTime = (...args) => {
      callback(...args)
      off(event, oneTime)
    }
    on(event, oneTime)
  }

  const emit = (event, ...args) => {
    console.log('Mock Socket Emit:', event, args)
    const callback = args[args.length - 1]

    switch (event) {
      case 'create-room': {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase()
        rooms[code] = [] // initialize empty message array for new room
        if (typeof callback === 'function') callback(code)
        break
      }

      case 'message': {
        const { code, message } = args[0]
        if (!rooms[code]) rooms[code] = []
        rooms[code].push({ message })
        // Notify listeners that messages updated for this room
        if (listeners.has('previous-messages')) {
          listeners.get('previous-messages').forEach((cb) => cb(rooms[code], code))
        }
        break
      }

      case 'join-room': {
        const { code } = args[0]
        if (!rooms[code]) rooms[code] = []
        // Emit room joined confirmation
        if (listeners.has('room-joined')) {
          listeners.get('room-joined').forEach((cb) => cb(code))
        }
        // Send current messages of that room only
        if (listeners.has('previous-messages')) {
          listeners.get('previous-messages').forEach((cb) => cb(rooms[code], code))
        }
        break
      }

      default:
        break
    }
  }

  const connect = () => {
    console.log('Mock Socket: Connected ✅')
    if (listeners.has('connect')) {
      listeners.get('connect').forEach((cb) => cb())
    }
  }

  return { on, off, once, emit, connect, id: 'mock-socket-id' }
}

const socket = createMockSocket()
// --- END MOCK SOCKET ---


// --- Room Code Display ---
const RoomCodeDisplay = ({ code }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    const ta = document.createElement('textarea')
    ta.value = code
    ta.style.position = 'absolute'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed', err)
    }
    document.body.removeChild(ta)
  }

  return (
    <div className="flex items-center justify-between gap-2 p-3 my-2 rounded-lg bg-base-200">
      <span className="font-mono text-lg font-bold text-primary">{code}</span>
      <button onClick={copyToClipboard} className={`btn btn-ghost btn-sm btn-square ${copied ? 'text-success' : ''}`}>
        {copied ? <Check size={18} /> : <Clipboard size={18} />}
      </button>
    </div>
  )
}


// --- Send Tab ---
const SendTab = ({ onSend }) => {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim()) {
      onSend(text)
      setText('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea
        className="textarea textarea-bordered w-full min-h-[150px]"
        placeholder="Paste text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className="btn btn-primary btn-lg">
        <Send size={18} className="mr-2" /> Send Text & Create Room
      </button>
    </form>
  )
}


// --- Retrieve Tab ---
const RetrieveTab = ({ onRetrieve }) => {
  const [retrieveCode, setRetrieveCode] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (retrieveCode.trim()) {
      onRetrieve(retrieveCode.toUpperCase())
      setRetrieveCode('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
      <input
        type="text"
        placeholder="Enter room code"
        className="input input-bordered input-lg w-full flex-grow font-mono"
        value={retrieveCode}
        onChange={(e) => setRetrieveCode(e.target.value)}
      />
      <button type="submit" className="btn btn-secondary btn-lg">
        <ArrowRight size={18} className="mr-2" /> Join Room
      </button>
    </form>
  )
}


// --- Main App ---
export default function App() {
  const [messages, setMessages] = useState([])
  const [activeTab, setActiveTab] = useState('send')
  const [createdRoomCodes, setCreatedRoomCodes] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)

  useEffect(() => {
    socket.connect()

    const onPreviousMessages = (msgs, code) => {
      if (code === currentRoom) {
        setMessages(msgs)
      }
    }

    socket.on('previous-messages', onPreviousMessages)

    return () => {
      socket.off('previous-messages', onPreviousMessages)
    }
  }, [currentRoom])

  const handleSend = useCallback((message) => {
    socket.emit('create-room', (code) => {
      console.log('Room Created: ✅ ', code)
      setCreatedRoomCodes((prev) => [code, ...prev.slice(0, 4)])
      socket.emit('message', { code, message })
      handleRetrieve(code)
      setActiveTab('retrieve')
    })
  }, [])

  const handleRetrieve = useCallback((code) => {
    setCurrentRoom(code)
    socket.emit('join-room', { code })
    socket.once('room-joined', (joinedCode) => {
      console.log('Room Joined: ✅', joinedCode)
      setCurrentRoom(joinedCode)
    })
  }, [])

  const messageFeed = useMemo(() => {
    return (
      <div className="flex-grow w-full p-4 overflow-y-auto rounded-lg bg-base-200 min-h-[300px]">
        {messages.length > 0 ? (
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <p key={i} className="p-3 rounded-lg bg-base-100 shadow">
                {m.message}
              </p>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-opacity-60">
            <Inbox size={24} className="mr-2" /> Messages will appear here...
          </div>
        )}
      </div>
    )
  }, [messages])

  return (
    <div data-theme="dark" className="flex justify-center min-h-screen p-4 bg-base-100">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">TempText Transfer</h1>
        <p className="mb-8 text-center text-opacity-70">Send text to any device instantly.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="flex flex-col gap-6 p-6 bg-base-300 rounded-2xl shadow-xl">
            <div role="tablist" className="tabs tabs-boxed tabs-lg">
              <a role="tab" className={`tab ${activeTab === 'send' ? 'tab-active' : ''}`} onClick={() => setActiveTab('send')}>Send</a>
              <a role="tab" className={`tab ${activeTab === 'retrieve' ? 'tab-active' : ''}`} onClick={() => setActiveTab('retrieve')}>Retrieve</a>
            </div>

            {activeTab === 'send' ? <SendTab onSend={handleSend} /> : <RetrieveTab onRetrieve={handleRetrieve} />}

            {createdRoomCodes.length > 0 && (
              <div className="mt-4 border-t border-base-100 pt-4">
                <h3 className="text-lg font-semibold">Room Code History</h3>
                <p className="text-sm mb-2 text-opacity-60">Your recently created room codes.</p>
                {createdRoomCodes.map((code) => (
                  <RoomCodeDisplay key={code} code={code} />
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col p-6 bg-base-300 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Message Feed {currentRoom && `(${currentRoom})`}</h2>
            {messageFeed}
          </div>
        </div>
      </div>
    </div>
  )
}
