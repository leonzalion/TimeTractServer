const User = require('../../models/User.js');
const isValidText = require('../isValidText');
const to = require('await-to-js').default;

module.exports = async (req, res) => {
  const [error] = await to(isValidText(req.body.username));
  if (error) return await res.status(500).json({
    message: 'Invalid username. Reason: ' + error.message
  });
  const [createError, user] = await to(User.create(req.body));
  if (createError) {
    if (createError.code === 11000) {
      return await res.status(500).json({message: 'Username already taken.'});
    } else {
      return await res.status(500).json({
        ...createError,
        message: 'An unknown error occurred. Error: ' + createError.errmsg
      });
    }
  }
  await res.json(user);
};