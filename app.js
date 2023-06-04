const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

const expressLayouts = require('express-ejs-layouts');
const adminRouter = require('./routes/admin');
const userRouter = require('./routes/user');
const { processOrderStatus } = require('./middleware/middleware');

require('./config/dbConnection');
require('dotenv').config()



const app = express();
// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname,'public/assets1')))

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view options',{layout:'layouts/layout'})
app.set('layout', 'layouts/layout');
app.use(session({secret:'key',resave:false,saveUninitialized:false,cookie:{maxAge:6000000}}))
app.use(function nocache (req,res,next){
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
})
app.use(processOrderStatus)
app.use(expressLayouts);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.locals.cartItem=[]
app.locals.cartItems=[]
// app.locals.user=[]
app.use('/admin', adminRouter);
app.use('/', userRouter);

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

module.exports = app;
