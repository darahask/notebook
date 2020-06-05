var socket;
var button = document.getElementById("termstart");

button.onclick = function () {
  var terminalContainer = document.getElementById("terminal-container");
  var term = new Terminal({ cursorBlink: true });
  term.open(terminalContainer);

  socket = io.connect("http://localhost:3000");

  socket.on("connect", function () {
    term.write("\r\n*** Connected to backend***\r\n");

    // Browser -> Backend
    term.onData(function (data) {
      socket.emit("data", data);
    });

    // Backend -> Browser
    socket.on("data", function (data) {
      if(data == '[sudo] password for codeb: '){
        socket.emit('data','3823\n');
      }
      term.write(data);
    });

    socket.on("disconnect", function () {
      term.write("\r\n*** Disconnected from backend***\r\n");
    });
  });
};

function install(lang){
  socket.emit('data','sudo apt-get install ' + lang +'\n');
}