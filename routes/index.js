var express = require('express');
var router = express.Router({mergeParams:true});
var pdfocr = require('../ocr');
var fs = require('fs'); 
var multer = require('multer');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

var data = {};
var extxt = {};
var intructions = {
  gcc:{
    display:[
      "apt-get update",
      "apt-get install gcc",
      "gcc --version"
    ],
    install:[
      'echo 3823 | sudo -S apt-get -y update',
      'echo 3823 | sudo -S apt-get -y install gcc',
      "gcc --version"
    ]
  },
  'g++':{
    display:[
      "apt-get update",
      "apt-get install g++",
      "g++ --version"
    ],
    install:[
      'echo 3823 | sudo -S apt-get -y update',
      'echo 3823 | sudo -S apt-get -y install g++',
      "g++ --version"
    ]
  },
  python3:{
    display:[
      "apt-get update",
      "apt-get install python3",
      "python3 --version"
    ],
    install:[
      'echo 3823 | sudo -S apt-get -y update',
      'echo 3823 | sudo -S apt-get -y install python3',
      "python3 --version"
    ]
  },
  libreoffice:{
    display:[
      "apt-get update",
      "apt-get install libreoffice",
    ],
    install:[
      'echo 3823 | sudo -S apt-get -y update',
      'echo 3823 | sudo -S apt-get -y install libreoffice',
    ]
  }
}

router.get('/split',function(req,res){
  res.render('split');
})

router.get('/',function(req,res){
  res.render('cover');
});

router.get('/info/:id',function(req,res){
  if(req.params.id == 'gcc'){
    var process = pdfocr('./instfiles/advancedC/in.pdf');
    process.on('complete',function(data){
      extxt = {inst:data.text_pages,route:'gcc'};
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
      extxt = {inst:data.text_pages,route:'g++'};
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
      extxt = {inst:data.text_pages,route:'python3'};
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
      extxt = {inst:data.text_pages,route:'libreoffice'};
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

router.get('/install/:id',(req,res)=>{ 
  show(req,res,req.params.id);
});

async function show(req,res,id){
  var cont = [];
  for(i =0; i< intructions[id].install.length;i++){
    const { stdout, stderr } = await exec(intructions[id].install[i]);
    console.log('stdout:', stdout);
    cont.push({ 
      display:intructions[id].display[i],
      stdout:stdout
    })
  }
  res.render('install',{data:cont});
}

router.get("/editor", function (req, res) {
  // process.exec('service ssh start',(err,stdout,stderr)=>{
  //   if (err) {  
  //     console.error(err);  
  //     return;  
  //   }  
  //   console.log(stderr);
  //   console.log(stdout);  
    
  // })
  res.render("term.ejs",{data:data});
});

router.post("/editor",function(req,res){
  var fileName = req.body.filename;
  var code = req.body.code;
  fs.writeFile('/home/darahas/' + fileName,code,function(err){
    if(err) return console.log(err);
  });
  data = {file:fileName,code:code};
  res.redirect('/editor');
});

router.get('/show/loading',(req,res)=>{
  res.render("split");
});

router.post('/show/:id',(req,res)=>{
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
router.post("/open",upload.single('myFile'),function(req,res){
  var code = req.file.buffer.toString('utf-8');
  data = {file:req.file.originalname,code:code};
  res.redirect('/editor');
});

module.exports = router;