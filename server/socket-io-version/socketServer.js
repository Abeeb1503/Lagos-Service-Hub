const http = require('http')
const { Server } = require('socket.io')
const app = require('../index')
const { registerChatSockets } = require('../socket/chat')

const port = Number(process.env.PORT || 3000)
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})

registerChatSockets(io)

server.listen(port, () => {
  process.stdout.write(`Socket.IO server listening on http://localhost:${port}\n`)
})

