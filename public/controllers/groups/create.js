const Group = require('../../models/Group.js');
const mongoose = require('mongoose');
const isValidText = require('../isValidText');
const to = require('await-to-js').default;

module.exports = async (req, res) => {
  const {name, members} = req.body;
  const [err, result] = await to(isValidText(name));
  if (err) return await res.status(500).json({
    message: 'Invalid group name. Reason: ' + result.message
  });
  members.forEach((member) => mongoose.Types.ObjectId(member));
  const [error, data] = await to(Group.create({name, members}));
  if (error) return await res.status(500).json(error);
  return await res.json(data);
};