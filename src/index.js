const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server)

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

let count = 0;

io.on('connection', (socket) => {
    socket.emit('countUpdated', count);
    socket.on('increment', () => {
       count++;
       io.emit('countUpdated', count);
    })

    socket.emit('message', 'Welcome');
    socket.broadcast.emit('message', 'A new user has joined the team');


    socket.on('sendMessage', (message) => {
        console.log('it is executes');
        io.emit('message', message);
    });
    socket.on('sendLocation', (coords) => {
        console.log('coords in the index.js', coords);
        io.emit('message', `Location: ${coords.latitude}, ${coords.longitude}`)
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user had left');
    })

    
})



server.listen(port, () => {
    console.log(`Server is up on the port ${port}`)
})