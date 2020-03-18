const Group = require('../../models/Group');
const getUser = require('../getUser');
const to = require('await-to-js').default;

module.exports = async (req) => {
  const [err, user] = await to(getUser(req));
  if (err) return Promise.reject({message: "Failed authentication."});

  const groupId = req.params.id;
  if (user.groupId != groupId) return Promise.reject({message: "Not authorized."});

  const group = await Group.findById(groupId).populate('members').exec();
  return Promise.resolve({group, user});
};
