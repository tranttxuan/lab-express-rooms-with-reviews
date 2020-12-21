require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const User = require("./models/User");
const bcrypt = require("bcrypt");


mongoose
  .connect('mongodb://localhost/rooms-app', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Passport

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;


// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60 * 1000,
    }),
  })
);

// Passport.js login -   put further down -  before express view engine setup

app.use(passport.initialize());
app.use(passport.session());

// we serialize only the `_id` field of the user to keep the information stored minimum
passport.serializeUser((user, done) => {
  done(null, user._id);
});
// when we need the information for the user, the deserializeUser function is called with the id that we previously serialized to fetch the user from the database
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((dbUser) => {
      done(null, dbUser);
    })
    .catch((err) => {
      done(err);
    });
});

passport.use(
  new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
    (username, password, done) => {

      User.findOne({ email: username })
        .then((found) => {
          if (found === null) {
            done(null, false, { errorMessage: "Wrong credentials" });
          } else if (!bcrypt.compareSync(password, found.password)) {
            done(null, false, { errorMessage: "Wrong credentials" });
          } else {
            done(null, found);
          }
        })
        .catch((err) => {
          done(err, false);
        });
    })
);


// login connect-flash for the error messages

const flash = require("connect-flash");
app.use(flash());


// Express View engine setup

app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));



// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';



const index = require('./routes/index');
app.use('/', index);
const auth = require('./routes/auth');
app.use('/', auth);
const room = require('./routes/room');
app.use('/rooms', room);

module.exports = app;
