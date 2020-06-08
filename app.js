var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require("socket.io")(server);
var sshClient = require("ssh2").Client;
var fs = require('fs');
var multer =  require('multer');

app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.static('node_modules'));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ urlencoded: true, extended: true }));

//Socket Code
io.on("connection", function (socket) {
  var conn = new sshClient();
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
      });
    })
    .on("close", function () {
      socket.emit("data", "\r\n*** SSH CONNECTION CLOSED ***\r\n");
    })
    .on("error", function (err) {
      socket.emit(
        "data",
        "\r\n*** SSH CONNECTION ERROR: " + err.message + " ***\r\n"
      );
    })
    .connect({
      host: "0.0.0.0",
      port: "22",
      username: "codeb",
      password: "3823",
    });
});

var data = {};

//Routes
app.get("/", function (req, res) {
  res.render("term.ejs",{data:data});
});

app.post("/",function(req,res){
  var fileName = req.body.filename;
  var code = req.body.code;
  fs.writeFile('/home/codeb/Documents/' + fileName,code,function(err){
    if(err) return console.log(err);
  });
  data = {file:fileName,code:code};
  res.redirect('/');
});

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, '/uploads/'))
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname)
//   }
// });
var upload = multer();

app.post("/open",upload.single('myFile'),function(req,res){
  var code = req.file.buffer.toString('utf-8');
  data = {file:req.file.originalname,code:code};
  res.redirect('/');
});

server.listen(3000);
console.log('SERVER STARTED!!!');