import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const port = 3001

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

const generate6digitCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
let rooms = {}

io.on('connection', (socket) => {
  console.log('a user connected')
  
  socket.on('create-room',(callback)=>{
    const code = generate6digitCode()
    rooms[code]=[]
    socket.join(code)
    io.to(code).emit('room-created',code)
    console.log('room created 🏠:',code)
    callback(code)
  })

  socket.on('message',({code,message})=>{
    const msgObj = {sender:socket.id,message}
    if(rooms[code]) rooms[code].push(msgObj)
    io.to(code).emit('message',{sender:socket.id,message})
    console.log(`Emitting ${message} this to room with Code: ${code}`);
  })


  socket.on('join-room',({code})=>{
    socket.join(code)
    console.log(`${socket.id} joined `,code);
    socket.emit('room-joined',code)

    if(rooms[code]) {
      socket.emit('previous-messages',rooms[code])
    }
  })
 
 
  
  socket.on('disconnect', (reasons) => {
    console.log(`user ${socket.id} disconnected: ${reasons}`);
  })
})



httpServer.listen(3001, () => {
  console.log('listening on *:3001')
})

