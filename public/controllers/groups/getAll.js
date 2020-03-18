const Group = require('../../models/Group');
const escapeStringRegexp = require('escape-string-regexp');
const to = require('await-to-js').default;

module.exports = async (req, res) => {
  const search = escapeStringRegexp(req.query.search);
  let slimGroups = [];
  const [err, groups] = await to(Group.find({name: RegExp(search, 'g')}).exec());
  if (err) return await res.status(500).json(err);
  groups.filter(({name}) => name.includes(search))
  .sort((g1, g2) => g2.members.length - g1.members.length)
  .forEach(group => slimGroups.push({
    _id: group._id,
    name: group.name,
    num_members: group.members.length
  }));
  await res.json(slimGroups);
};