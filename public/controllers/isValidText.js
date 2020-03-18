const Filter = require('bad-words');
const filter = new Filter();

module.exports = function (text) {
  if (!/^[0-9a-zA-Z_\-]+$/.test(text)) {
    return Promise.reject({
      message: 'Invalid characters (only letters, numbers, dash and underscore allowed).'
    });
  }
  if (filter.isProfane(text)) {
    return Promise.reject({message: 'Inappropriate.'});
  }
  return Promise.resolve();
};