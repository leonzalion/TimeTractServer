const getUser = require('../getUser');
const to = require('await-to-js').default;

module.exports = async (req, res) => {
  const [error, result] = await to(getUser(req));
  console.log(error);
  if (error) return await res.status(401).json(error);
  console.log(result);
  await res.json(result);
};
