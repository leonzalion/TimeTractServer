const {getUserId} = require('../utils');

function user(parent, args, context) {
  const userId = args.id || getUserId(context);
  console.log(userId);
  return context.prisma.user.findOne({
    where: {id: userId}
  });
}

function users(parent, args, context) {
  return context.prisma.user.findMany({});
}

async function group(parent, args, context) {
  const group = await context.prisma.group.findOne({
    where: {id: args.id}
  });
  return group;
}

async function groups(parent, args, context) {
  const where = args.filter ? {
    name_contains: args.filter
  } : {};
  const groups = await context.prisma.group.findMany({
    where,
    skip: args.skip,
    first: args.first
  });
  return groups;
}

module.exports = {user, users, group, groups};