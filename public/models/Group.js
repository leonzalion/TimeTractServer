const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  blurb: {
    type: String
  },
  desc: {
    type: String
  },
  members: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }]
  },
});

GroupSchema.index({name: "text", blurb: "text"});

const Group = mongoose.model('Group', GroupSchema);

module.exports = Group;