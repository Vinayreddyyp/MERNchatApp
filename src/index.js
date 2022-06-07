const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server)

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

let count = 0;

io.on('connection', (socket) => {
    socket.emit('countUpdated', count);





    socket.on('joined', ({ username, room }, callback) => {
        const { user, error } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error);
        }
        socket.join(room)
        socket.emit('message', generateMessage('Welcome Message'));
        socket.broadcast.to(room).emit('message', 'A new user has joined the team');
        callback();
    })
    socket.on('sendMessage', (message, callback) => {
        console.log('message has been invoked', message);
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined the chat`));
        callback();
    });



    socket.on('sendLocation', (coords, callback) => {

        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude}, ${coords.longitude}`));
        callback();
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user had left'));
    })


})



server.listen(port, () => {
    console.log(`Server is up on the port ${port}`)
})