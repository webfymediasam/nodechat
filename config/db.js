var mysql = require('mysql');
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'ical'
})
connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

//connection.end();

module.exports = connection;