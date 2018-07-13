const _ = require('lodash');
const jwt = require('jsonwebtoken');
const winston = require('winston');

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const User = mongoose.model('User');
const Group = mongoose.model('Group');

const tokenCache = require('../lib/token_cache');

const jwtSecret = process.env.JWT_SECRET || 'secret';

const ActiveDirectory = require('activedirectory');
const domain = 'ad.calstatela.edu';
const ad = new ActiveDirectory({
  url: 'ldap://' + domain,
  baseDN: 'dc=ad,dc=calstatela,dc=edu'
});
const adAuthenticate = Promise.promisify(ad.authenticate, {
  context: ad
});

router.post('/login', async function(req, res, next) {
  let username = req.body.username;
  let password = req.body.password;
  if (!username || !password) {
    res.send({ success: false, msg: 'Missing username and/or password' });
    return;
  }

  try {
    let user = await User.findOne({ username });
    if (user == null || user.disabled) return res.sendStatus(400);

    let authenticated = user.internal
      ? await user.comparePassword(password)
      : await adAuthenticate(username + '@' + domain, password);
    if (!authenticated) return res.sendStatus(400);

    let groupsWithUser = await Group.find({ member: user._id });
    const issueTime = new Date().getTime();
    const token = jwt.sign(
      _.assign(user.excludeFields(['passwordHash']), { issued: issueTime }),
      jwtSecret
    );
    tokenCache.issueToken(user._id, token, issueTime);
    res.json({
      user: user.excludeFieldsWithConfig(),
      groups: _.map(groupsWithUser, group => {
        return {
          name: group.name,
          _id: group._id
        };
      }),
      token: token
    });
    winston.info(`${user.username} logged in successfully.`);
  } catch (err) {
    if (err.name === 'InvalidCredentialsError') return res.sendStatus(400);
    else return next(err);
  }
});
module.exports = router;
