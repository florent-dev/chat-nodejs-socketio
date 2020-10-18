/**
 * Dépendances
 */
let http = require('http');
let url = require('url');
let ejs = require('ejs');
let fs = require('fs');

/**
 * Variables
 */
let getFormattedTime = function() {return new Date().toISOString().substr(11, 8);}

/**
 * Server listening
 */
let server = http.createServer(function (req, res) {
    let parsedUrl = url.parse(req.url).pathname;

    // sending the public specified file or the main page chat.ejs
    fs.readFile(__dirname+'/public/'+parsedUrl, function (err, data) {
        if (err) {
            ejs.renderFile('./views/chat.ejs', function (err, str) {
                res.setHeader('Content-Type', 'text/html');
                res.end(str);
            });
        } else {
            res.end(data);
        }
    });

}).listen(8888);

/**
 * Socket.io listening
 */
let io = require('socket.io').listen(server);

// guest connecting with the server
io.sockets.on('connection', function (socket) {
    socket.emit('SERVER_MSG', { content: '[•] Vous êtes bien connecté !', importance: 2 });
    socket.emit('NEED_PSEUDO');

    // guest sharing its pseudo
    socket.on('SHARE_PSEUDO', function (pseudo) {
        if (pseudo === undefined || pseudo === null) return socket.emit('NEED_PSEUDO');
        socket.pseudo = pseudo.toUpperCase();
        socket.broadcast.emit('SERVER_MSG', { content: '[•] <b>'+socket.pseudo+'</b> vient de se connecter.', importance: 2 });
    });

    // user sending a message
    socket.on('CLIENT_MSG', function (message) {
        let msgToSend = getFormattedTime()+' <b>'+socket.pseudo+':</b> '+message;
        socket.emit('SERVER_MSG', { content: msgToSend, importance: 1 });
        socket.broadcast.emit('SERVER_MSG', { content: msgToSend, importance: 1 });
    });
});

console.log("["+getFormattedTime()+"] OK. Listening on 8888 port");