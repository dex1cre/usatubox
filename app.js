//Подключаем модули
var express, bodyParser, app, port, server, helmet, sqlite3, bd;

express = require('express');
bodyParser = require('body-parser');
server = require('./server');
helmet = require('helmet');
sqlite3 = require("sqlite3").verbose();
db = new sqlite3.Database("some_db.db");
port = 3010;
app = express();


//Настройка приложения
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.disable("x-powererd-by");
app.use(express['static'](__dirname + '/public'));
app.set('view engine', 'pug');
app.use(helmet())

app.use(function(req, res, next) {
	if(server.data[req.path])
	{
		server.data[req.path](req, res);
	} else {
		res.end("404");
	}
});


app.listen(port, function(req, res) {
	console.log("Server start on port " + port);
});
