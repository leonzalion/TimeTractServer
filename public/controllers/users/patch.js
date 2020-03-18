const User = require('../../models/User.js');
const getUser = require('../getUser');
const mongoose = require('mongoose');
const to = require('await-to-js').default;

module.exports = async (req, res) => {
  const [userError, user] = await to(getUser(req));
  if (userError) return await res.status(401).json(userError);

  const new_values = {$set: {}};

  (function recurse(obj, base) {
    Object.keys(obj).forEach((key) => {
      let val = obj[key];
      if (!Array.isArray(val) && !(val instanceof Date) && typeof val === "object" && val !== null) {
        recurse(val, `${base && base + '.'}${key}`);
      } else {
        new_values.$set[`${base && base + '.'}${key}`] = val;
      }
    });
  })(req.body, "");

  const [updateError, new_user] = await to(User.findByIdAndUpdate(user._id, new_values, {
    upsert: true, new: true
  }).exec());
  if (updateError) return await res.status(500).json(updateError);
  await res.json(new_user);
};
