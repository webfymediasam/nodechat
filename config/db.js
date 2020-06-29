var mysql = require('mysql');
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'prem',
	password: 'prem',
	database: 'averti_new'
})
connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

//connection.end();

module.exports = connection;