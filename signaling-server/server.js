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

io.on('connection', (socket) => {
  console.log('a user connected')
  
  socket.on('create-room',(callback)=>{
    const code = generate6digitCode()
    socket.join(code)
    io.to(code).emit('room-created',code)
    console.log('room created 🏠:',code)
    callback(code)
    io.to(code).emit('room-created_send-message')
  })

  socket.on('message',({code,message})=>{
    io.to(code).emit('message',message)
    console.log(`Emitting ${message} this to room with Code: ${code}`);
  })


  // socket.on('join-room',(code)=>{
  //   socket.join(code)
  //   io.emit('room-joined 🏠: ',code)
  //   io.to(code).emit()
  //   console.log(`${socket.id} joined ${code}`);
  // })
 
  socket.on('recieve-message', (code,message) => {
    io.to(code).emit('message',message)
    console.log(`Emitting ${message} this to room with Code: ${code}`);
  })
  
  socket.on('disconnect', (reasons) => {
    console.log(`user ${socket.id} disconnected: ${reasons}`);
  })
})



httpServer.listen(3001, () => {
  console.log('listening on *:3001')
})

