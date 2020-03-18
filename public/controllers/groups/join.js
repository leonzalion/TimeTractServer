const Group = require('../../models/Group.js');
const getUser = require('../getUser');
const User = require('../../models/User.js');
const to = require('await-to-js').default;

module.exports = async (req, res) => {
  const [err, user] = await to(getUser(req));
  if (err) return await res.status(500).json(err);
  const [error, group] = await to(Group.findByIdAndUpdate(req.params.id, {
    $push: {members: user._id}
  }).exec());
  if (error) return await res.status(500).json(error);
  await User.findByIdAndUpdate(user._id, {$set: {groupId: req.params.id}}).exec();
  await res.json({groupId: req.params.id});
};