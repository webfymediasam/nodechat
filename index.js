var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
const db = require('./config/db');
const path = require("path") 
const multer = require("multer");
var router = express.Router();
global.fullpath;
global.messageId;
global.imgURL;
app.use(express.static('public'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.post('/uploadFile',function(req, res){
    upload(req,res,function(err) { 
  
        if(err) { 
  
            // ERROR occured (here it can be occured due 
            // to uploading image of size greater than 
            // 1MB or uploading different file type) 
            res.send(err) 
        } 
        else { 
  db.query('update message set attachment_url =? where id =?',[fullpath,messageId],(err, result)=>{
	  global.imgURL ='';
  })
            // SUCCESS, image successfully uploaded 
            res.send("Success, Image uploaded!") 
        } 
    })
});
var storage = multer.diskStorage({ 
    destination: function (req, file, cb) { 
  
        // Uploads is the Upload_folder_name 
        cb(null, "./public/uploads") 
    }, 
    filename: function (req, file, cb) { 
	global.fullpath = req.protocol + '://' + req.get('host') +'/uploads/'+file.fieldname + "-" + Date.now()+path.extname(file.originalname);
      cb(null, file.fieldname + "-" + Date.now()+path.extname(file.originalname)) 
    } 
  });
  // Define the maximum size for uploading 
// picture i.e. 1 MB. it is optional 
const maxSize = 1 * 1000 * 1000; 
    
var upload = multer({  
    storage: storage, 
    limits: { fileSize: maxSize }, 
    fileFilter: function (req, file, cb){ 
    
        // Set the filetypes, it is optional 
        var filetypes = /jpeg|jpg|png|pdf|doc|docx|gif/; 
        var mimetype = filetypes.test(file.mimetype); 
  
        var extname = filetypes.test(path.extname( 
                    file.originalname).toLowerCase()); 
        
        if (mimetype && extname) { 
            return cb(null, true); 
        } 
      
        cb("Error: File upload only supports the "
                + "following filetypes - " + filetypes); 
      }  
  
// mypic is the name of file attribute 
}).single("chatAttachment");
io.on('connection', function(socket){
  socket.on('chat message', function(data){
  let val ={room_id:socket.room_id,sender_id:socket.from,receiver_id:socket.to,message_text:data.msg}
  let sql = 'INSERT INTO message SET ?';
    db.query(sql,val, function (err, result) {
      if (err) io.emit('chat message',err);
      if(result.insertId>0){
		  global.messageId = result.insertId;
		io.emit('bind_msg',{sender_id:socket.from,receiver_id:socket.to,message_text:data.msg,img_URL:imgURL}); 
      }

    });
   
  });
   socket.on('Image_URL', function(data){
	global.imgURL =   data; 
   });
     socket.on('create_room', function(data) {
  socket.from = parseInt(data.curren_user);
  socket.to = parseInt(data.clientId);
  code = socket.from + socket.to ;
  db.query('select id from chat_room where code =?',code,(err, result)=>{
    if (err)  socket.emit('AllMessageFromRoom',err);
    if(!result.length){
  let val ={name:code,code:code,type:1,capacity:2}
  let sql = 'INSERT INTO chat_room SET ?';
    db.query(sql,val, function (err, result) {
      if (err) socket.emit('room_id',err);
	  socket.room_id =result.insertId
      socket.emit('AllMessageFromRoom',result.insertId);
      
    });
  }
  else{
	  socket.room_id =result[0].id
	  socket.emit('AllMessageFromRoom',result[0].id);
  
  }
});

	socket.on('messageData', function(room_id){
		 let sql = 'Select * from message where room_id=?';
    db.query(sql,[room_id], function (err, result) {
      if (err) socket.emit('messageDataAll',err);
     socket.emit('messageDataAll',result);

    });
        });
        //io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
    });
   socket.on('username', function(username) {
        socket.username = username;	
        //io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
    });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
