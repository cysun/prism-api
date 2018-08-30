global.Promise = require('bluebird');

require('dotenv').config();
const settings = require('./lib/config/settings');

const morgan = require('./log').morgan;
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
var RateLimit = require('express-rate-limit');

const app = express();
app.disable('x-powered-by');

const access = require('./lib/access');
const db = require('./db');
db.init([access.init]);
const routes = require('./routes');
require('./lib/config/passport');

app.use(morgan);
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({limit: '500mb', extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

const authMiddleware = passport.authenticate('jwt', {session: false});

app.get('*', function(req, res, next) {
  if (req.path.indexOf('/api') === 0) {
    next();
  } else {
    res.sendFile(__dirname + '/public/index.html');
  }
});

app.use('/api/login', new RateLimit({
  windowMs: settings.rateLimitWindow,
  max: settings.loginRequestLimit,
  delayMs: 0
}));

app.use('/api', new RateLimit({
  windowMs: settings.rateLimitWindow,
  max: settings.requestLimit,
  delayMs: 0
}));

app.use(function(req, res, next) {
  if (req.path === '/api/login' || (req.path.indexOf('/api/external-upload') === 0 && req.path.indexOf('cancel') === -1)) {
    next();
  } else {
    authMiddleware(req, res, next);
  }
});

app.use(function(req, res, next) {
  if (req.newToken) {
    res.set('X-PRISM-New-Token', req.newToken);
  }
  next();
});

for (let route of routes) {
  app.use('/api', route);
}
require('./lib/cron');
require('./error_handler')(app);

// Teardown can be passed any modules necessary for proper teardown
require('./teardown')(db.disconnect);

module.exports = app;
