var express = require('express');
var router = express.Router();
const db = require('../config/db');
router.post('/postmsg', function(req, res, next) {
    let val ={room_id:req.body.room_id,sender_id:req.body.from,message_text:req.body.message_text}
    let sql = `INSERT INTO message SET ?`;
      db.query(sql,val, function (err, result) {
        if (err) res.json(err);
        if(result.insertId>0){
          db.query('INSERT INTO  msg_receivers SET ?',{message_id:result.insertId,	receiver_id:req.body.to}, function (err, result) {
            if (err) res.json(err);
            res.json(result.insertId);
          });
        }
  
      });
  });
  router.post('/getSenderMsgfromRoom', async function(req, res, next) {
    let sql = `Select message_text,created_date	from message where room_id=? and sender_id=?`;
      db.query(sql,[req.body.room_id,req.body.sender_id], function (err, result) {
        if (err) res.json(err);
        if(result.length>0){
          res.render('message',{sentmsg:result});
        }
  
      });
  });
  router.post('/getReciverMsgfromRoom', function(req, res, next) {
    let sql = `Select message.message_text,message.created_date	from message join msg_receivers on message.id = msg_receivers.message_id  where message.room_id=? and msg_receivers.receiver_id=?`;
      db.query(sql,[req.body.room_id,req.body.receiver_id], function (err, result) {
        if (err) res.json(err);
        if(result.length>0){
          res.json(result);
        }
  
      });
  });