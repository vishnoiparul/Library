//----------------Requiring Modules------------------------------

const express = require('express')
const http = require('http')
const createError = require('http-errors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
// const fs = require('fs')
const logger = require('morgan')
// const rfs = require('rotating-file-stream')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')(session)
const flash = require('express-flash')


global.projectName = "The Splendid Online Library"

//Initializing express
var app = express()


// const busboyBodyParser = require('busboy-body-parser');
// app.use(busboyBodyParser());

//Requiring routes file
var indexRouter = require('./routes/index')
// var usersRouter = require('./routes/users')


//Requiring Configuration file
var config = require('./configs/config.js')

//Requiring ModelProvider
var ModelProvider = require('./db/ModelProvider.js')

//--------------Middlewares-----------------------------------


//Bodyparser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())


// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Setting up session
app.use(cookieParser());
app.use(cookieParser('mylibrarysecret'))
app.use(session({
	key	: 'app.sess',
	secret : 'mylibrarysecret',
	resave : true,
	saveUninitialized : false,
	store : new MongoStore({
		db : 'librarySession',
		host : '127.0.0.1',
		port : 3001,
		url: 'mongodb://localhost:27017/libraryDb'
	}),
	cookie : {
		maxAge : 10*60*1000
	}
}))
app.use(express.Router())

//Initializing Flash
// app.use(flash())

//Initialing routes files
app.use('/', indexRouter);
// app.use('/users', usersRouter);

// //Setting up session
// app.use(session({
//   secret : 'mysecret key',
//   resave : true,
//   saveUninitialized : false,
//   cookie: {
//     maxAge : 1*60*1000
//   }
// }))

//Other Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

//Setting up logger
var logDirectory = path.join(__dirname, 'logger')
app.use(logger('dev'));

//Loading Database
mongoose.Promise = global.Promise
mongoose.connect(config.get('db.host'))
	.then(() => {
		ModelProvider.loadModels(mongoose)
	})
	.catch((err) => {
		console.log("Working")
		console.log(err)
	})

// mongoose.connect(config.get('db.host'),function(err){
// 	ModelProvider.loadModels(mongoose);
// 	console.log('db connected');
// });


//Creating server
var server = http.createServer(app)
server.listen(config.get('port'), config.get('ip'), function(x) {
  var addy = server.address();
  console.log('running on http://' + addy.address + ":" + addy.port);
});


//-----------------------------------------------------------------------------------------



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

