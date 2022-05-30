const socket = io();


const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');

const $locationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


socket.on('countUpdated', (count) => {
    console.log('The count has been updated', count)
})


socket.on('message', (message) => {
    console.log('messsages from the generated function', message)

    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html);
    socket.on('locationMessage', (message) => {
        const html = Mustache.render(locationMessageTemplate, {
            url: message.url,
            createdAt: moment(message.createdAt).format('h:mm a')
        })
        $messages.insertAdjacentHTML('beforeend', html)
    })




    $messageForm.addEventListener('submit', (e) => {

        e.preventDefault();
        $messageFormButton.setAttribute('disabled', 'disabled');
        const message = e.target.message.value;

        socket.emit('sendMessage', message, (error) => {

            console.log('message is disables')
            $messageFormButton.removeAttribute('disabled');
            $messageFormInput.value = '';
            $messageFormInput.focus();

            if (error) {
                return console.log('error', error);
            }

            console.log('Message has been deliverd');
        });
    })



    document.querySelector('#send-location').addEventListener('click', () => {

        if (!navigator.geolocation) {
            return alter('Geolocation not supported')
        }
        $locationButton.setAttribute('disabled', 'disabled')

        navigator.geolocation.getCurrentPosition((position) => {
            console.log('post', position.coords.latitude);

            socket.emit('sendLocation', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            }, () => {
                $locationButton.removeAttribute('disabled');
                console.log('Locatiion has been shared');
            })
        })
    })
})
socket.emit('join', { username, room })