const User = require('../models/User');
const bcrypt = require('bcrypt');
const to = require('await-to-js').default;

module.exports = async (req) => {
  if (!req.headers.authorization || !req.headers.authorization.includes('Basic '))
    return Promise.reject({message: "Missing Authorization Header"});

  const base64Credentials = req.headers.authorization.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  const [userError, user] = await to(User.findOne({username}).select('+password').exec());
  if (userError) return Promise.reject({message: "User not found."});

  const match = await bcrypt.compare(password, user.password);
  if (match) return Promise.resolve(await User.findById(user._id).exec());
  else return Promise.reject({message: "Incorrect username or password."});
};
