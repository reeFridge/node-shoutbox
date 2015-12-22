var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var user = require('./lib/middleware/user');
var validate = require('./lib/middleware/validate');
var page = require('./lib/middleware/page');
var Entry = require('./lib/entry');

var sess = {
  secret: 'keyboard fridge',
  resave: false,
  saveUninitialized: true,
  cookie: {}
};

var routes = require('./routes/index');
var users = require('./routes/users');
var register = require('./routes/register');
var login = require('./routes/login');
var entries = require('./routes/entries');
var api = require('./routes/api');
var messages = require('./lib/messages');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(session(sess));
app.use(messages);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', api.auth);
app.use(user);

//app.use('/', routes);
//app.use('/users', users);

var loggedOnly = function (req, res, next) {
  if (res.locals.user) {
    next();
  } else {
    res.error('You are not logged in.');
    res.redirect('back');
  }
};

app.get('/post', loggedOnly, entries.form);
app.post('/post',
  loggedOnly,
  validate.required('entry[title]'),
  validate.lengthAbove('entry[title]', 4),
  validate.required('entry[body]'),
  entries.submit
);

app.get('/register', register.form);
app.post('/register', register.submit);

app.get('/login', login.form);
app.post('/login', login.submit);
app.get('/logout', login.logout);

app.get('/:page?', page(Entry.count, 5), entries.list);

app.get('/api/user/:id', api.user);
app.post('/api/entry', entries.submit);
app.get('/api/entries/:page?', page(Entry.count, 5), api.entries);

if(process.env.ERROR_ROUTE) {
  app.get('/dev/error', function (req, res, next) {
    var err = new Error('database connection faild');
    err.type = 'database';
    next(err);
  });
}

// catch 404 and forward to error handler
app.use(routes.notFound);
app.use(routes.error);

/*
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
*/

// error handlers

// development error handler
// will print stacktrace
/*
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
*/

// production error handler
// no stacktraces leaked to user
/*
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
*/


module.exports = app;
