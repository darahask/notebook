var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var io = require("socket.io")(server);
var sshClient = require("ssh2").Client;
var indexRoutes = require('./routes/index')

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ urlencoded: true, extended: true }));
app.use(indexRoutes);

//Socket Code
io.on("connection", function (socket) {
  var conn = new sshClient();
  conn.connect({
    host: "0.0.0.0",
    port: "22",
    username: "darahas",
    password: "3823",
  });
  conn
    .on("ready", function () {
      socket.emit("data", "\r\n*** SSH CONNECTION ESTABLISHED ***\r\n");
      conn.shell(function (err, stream) {
        if (err)
          return socket.emit(
            "data",
            "\r\n*** SSH SHELL ERROR: " + err.message + " ***\r\n"
          );
        socket.on("data", function (data) {
            stream.write(data);
        });
        stream
          .on("data", function (d) {
            socket.emit("data", d.toString("binary"));
          })
          .on("close", function () {
            conn.end();
          });
      })
    })
    .on("close", function () {  
      socket.emit("data", "\r\n*** SSH CONNECTION CLOSED ***\r\n");
    })
    .on("error", function (err) {
      socket.emit(
        "data",
        "\r\n*** SSH CONNECTION ERROR: " + err.message + " ***\r\n"
      );
    });

});

server.listen(process.env.PORT,process.env.IP);
console.log('SERVER STARTED!!!');