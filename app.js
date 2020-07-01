var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require("socket.io")(server);
var sshClient = require("ssh2").Client;
var fs = require('fs');
var multer =  require('multer');
var pdfocr = require('./ocr');
const { request } = require('http');
var process = require('child_process')

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ urlencoded: true, extended: true }));

//Socket Code
io.on("connection", function (socket) {
  var conn = new sshClient();
  conn.connect({
    host: "0.0.0.0",
    port: "22",
    username: "codeb",
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
          if(data == "launch:xeyes"){
            conn.exec('xeyes',{x11:true},function(err, stream) {
              if (err) throw err;
              var code = 0;
              stream.on('end', function() {
                if (code !== 0)
                  console.log('Do you have X11 forwarding enabled on your SSH server?');
                conn.end();
              }).on('exit', function(exitcode) {
                code = exitcode;
              });
            })
          }else
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
    }).on('x11',function(info,accept,reject){
      var req = accept();
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

var data = {};
var extxt = [];

//Routes
app.get('/',function(req,res){
  res.render('cover');
});

app.get('/info/:id',function(req,res){
  if(req.params.id == 'gcc'){
    var process = pdfocr('./instfiles/advancedC/in.pdf');
    process.on('complete',function(data){
      extxt = data.text_pages;
      if(!req.query.download){
        res.render('info',{data:extxt});
      }
    });
    if(req.query.download === 'b'){
      res.download("./instfiles/advancedC/cbroch.pdf");
    }
    if(req.query.download === 'i'){
      res.download("./instfiles/advancedC/cinstr.pdf");
    }
  }else if(req.params.id == 'g++'){
    var process = pdfocr('./instfiles/advancedc++/in.pdf');
    process.on('complete',function(data){
      extxt = data.text_pages;
      if(!req.query.download){
        res.render('info',{data:extxt});
      }
    });
    if(req.query.download === 'b'){
      res.download("./instfiles/advancedc++/broch.pdf");
    }
    if(req.query.download === 'i'){
      res.download("./instfiles/advancedc++/instr.pdf");
    }
  }else if(req.params.id == 'python3'){
    var process = pdfocr('./instfiles/python3/in.pdf');
    process.on('complete',function(data){
      extxt = data.text_pages;
      if(!req.query.download){
        res.render('info',{data:extxt});
      }
    });
    if(req.query.download === 'b'){
      res.download("./instfiles/python3/broch.pdf");
    }
    if(req.query.download === 'i'){
      res.download("./instfiles/python3/instr.pdf");
    }
  }else if(req.params.id == 'libreoffice'){
    var process = pdfocr('./instfiles/libreoffice/in.pdf');
    process.on('complete',function(data){
      extxt = data.text_pages;
      if(!req.query.download){
        res.render('info',{data:extxt});
      }
    });
    if(req.query.download === 'b'){
      res.download("./instfiles/libreoffice/broch.pdf");
    }
    if(req.query.download === 'i'){
      res.download("./instfiles/libreoffice/instr.pdf");
    }
  }else{
    res.render('info',{data:extxt});
  }
});

app.get("/editor", function (req, res) {
  res.render("term.ejs",{data:data});
});

app.post("/editor",function(req,res){
  var fileName = req.body.filename;
  var code = req.body.code;
  fs.writeFile('/home/codeb/Documents/' + fileName,code,function(err){
    if(err) return console.log(err);
  });
  data = {file:fileName,code:code};
  res.redirect('/editor');
});

app.get('/show/loading',(req,res)=>{
  res.send('<h1>Application is being loaded</h1>');
});

app.post('/show/:id',(req,res)=>{
  if(req.params.id === 'libreoffice'){
    process.exec('libreoffice',(err,stdout,stderr)=>{
      if (err) {  
        console.error(err);  
        return;  
      }  
      console.log(stderr);
      console.log(stdout);  
    })
  }
});

var upload = multer();
app.post("/open",upload.single('myFile'),function(req,res){
  var code = req.file.buffer.toString('utf-8');
  data = {file:req.file.originalname,code:code};
  res.redirect('/editor');
});

server.listen(3000);
console.log('SERVER STARTED!!!');