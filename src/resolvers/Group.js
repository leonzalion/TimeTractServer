function leader(parent, args, context) {
  return context.prisma.group.findOne({where: {
    id: parent.id
  }}).leader();
}

function members(parent, args, context) {
  const where = args.filter ? { name_contains: args.filter } : {};
  return context.prisma.group.findOne({
    where: {id: parent.id}
  }).members({
    where,
    skip: args.skip,
    first: args.first,
  });
}

module.exports = {
  leader,
  members
};
