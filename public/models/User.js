const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const to = require('await-to-js').default;
const fetch = require('node-fetch');

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  email: {
    type: String,
    default: "",
    lowercase: true
  },
  rescuetime: {
    last_retrieved: {
      type: Date,
      default: new Date(0)
    },
    top_sites: Array,
    total_productive_time: Number,
    total_distracted_time: Number,
    // productive time that is manually calculated per group based on their
    // productive website filters (TODO)
    total_filtered_productive_time: Array,
    access_token: {
      type: String,
      default: ""
    }
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    set: function(val) {
      if (typeof val === 'string') val = mongoose.Types.ObjectId(val);
      return val;
    },
    ref: 'Group',
    default: null
  },
  avatar_url: {
    type: String,
    default: ""
  }
});

UserSchema.method( 'getRTData', async function () {
  console.log("getting data");

  const access_token = this.rescuetime.access_token;
  if (!access_token) return Promise.resolve(this.rescuetime);

  // checking if 30 minutes passed, if not return cached data
  const today = new Date();
  const elapsed_milliseconds = today - this.rescuetime.last_retrieved;

  function sameDay(d1, d2) {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  }

  if (!sameDay(today, this.rescuetime.last_retrieved) &&
    elapsed_milliseconds < 1000 * 60 * 30) return Promise.resolve(this.rescuetime);

  const [
    ,
    time_spent,
    ,
    ,
    ,
    productivity
  ] = [0, 1, 2, 3, 4, 5];

  const url = `https://www.rescuetime.com/api/oauth/data?access_token=${access_token}&format=json`;
  const response = await fetch(url, {
    method: 'get',
  });
  const rtlog = await response.json();

  if (response.status !== 200) {
    await this.updateOne({$set: {"rescuetime.access_token": ""}}).exec();
    return Promise.reject({message: "API token failed."});
  }


  let total_productive_time = 0;
  let total_distracted_time = 0;

  for (let i = 0; i < rtlog.rows.length; ++i) {
    const site = rtlog.rows[i];
    if (site[productivity] > 0)
      total_productive_time += site[time_spent];
    else if (site[productivity] < 0)
      total_distracted_time += site[time_spent];
  }

  this.rescuetime.last_retrieved = new Date();
  this.rescuetime.top_sites = rtlog.rows.slice(0, 5);
  this.rescuetime.total_productive_time = total_productive_time;
  this.rescuetime.total_distracted_time = total_distracted_time;
  await this.updateOne({$set: {rescuetime: this.rescuetime}}).exec();

  return Promise.resolve(this.rescuetime);
});

UserSchema.pre('save', function (next) {
  const user = this;

  bcrypt.hash(user.password, 10, (error, hash) => {
    user.password = hash;
    next();
  });

});

const User = mongoose.model('User', UserSchema);
module.exports = User;