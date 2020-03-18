const Group = require('../../models/Group');
const getUser = require('../getUser');
const User = require('../../models/User');

const to = require('await-to-js').default;

module.exports = async (req, res) => {
  const [userError, user] = await to(getUser(req));
  if (userError) return await res.status(401).json(userError);

  const [groupError, group] = await to(Group.findByIdAndUpdate(req.params.id,
  {$pull: {members: user._id}}, {new: true}).exec());
  if (groupError) return await res.status(401).json(groupError);

  if (group.members.length === 0) await Group.deleteOne({_id: group._id}).exec();
  const [saveError] = await to(User.findByIdAndUpdate(user._id, {$set: {groupId: null}}).exec());
  if (saveError) return await res.status(500).json(saveError);
  await res.json({groupId: null});
};