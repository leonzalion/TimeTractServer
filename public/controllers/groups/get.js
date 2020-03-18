const authGroup = require('./auth');
const to = require('await-to-js').default;
const User = require('../../models/User');

module.exports = async (req, res) => {
  const [err, {group}] = await to(authGroup(req));
  if (err) return await res.status(500).json(err);
  console.log("before", group);
  for (let i = 0; i < group.members.length; ++i) {
    const [err, user] = await to(User.findById(group.members[i]._id).exec());
    if (err) return await res.status(500).json(err);
    console.log(user);
    group.members[i].rescuetime = await user.getRTData();
  }
  console.log("after", group);
  return await res.json(group);
};