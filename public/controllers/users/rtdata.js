const getUser = require('../getUser');
const to = require('await-to-js').default;

module.exports = async (req, res) => {
  const [err, user] = await to(getUser(req));
  if (err) return await res.status(401).json(err);
  const [error, data] = await to(user.getRTData());
  if (error) return await res.status(500).json(error);
  return await res.json(data);
};
