function leader(parent, args, context) {
  return context.prisma.group({id: parent.id}).leader();
}

function members(parent, args, context) {
  return context.prisma.group({id: parent.id}).members();
}

module.exports = {
  leader,
  members
};
