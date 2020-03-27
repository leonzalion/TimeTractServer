const cloudinary = require('cloudinary').v2;

const fetch = require('node-fetch');

async function rescueTimeData(parent, args, context, info) {
  if (!parent.accessToken) return null;
  const url = `https://www.rescuetime.com/api/oauth/data?access_token=${parent.accessToken}&format=json`;
  const response = await fetch(url);
  const result = await response.json();

  const [
    ,
    timeSpent,
    ,
    name,
    category,
    productivity
  ] = [0, 1, 2, 3, 4, 5];

  let topSites = [];
  for (let i = 0; i < Math.min(result.rows.length, 5); ++i) {
    const site = result.rows[i];
    topSites.push({
      name: site[name],
      category: site[category],
      timeSpent: site[timeSpent],
      productivity: site[productivity]
    })
  }

  let productiveTime = 0, distractingTime = 0;
  for (let i = 0; i < result.rows.length; ++i) {
    const site = result.rows[i];
    if (site[productivity] > 0)
      productiveTime += site[timeSpent];
    else if (site[productivity] < 0)
      distractingTime += site[timeSpent];
  }

  const updatedRescueTime = {productiveTime, distractingTime, topSites};

  context.prisma.user.update({
    where: {id: parent.id},
    data: {
      rescueTimeData: {
        update: updatedRescueTime
      }
    }
  });

  return updatedRescueTime;
}

async function groups(parent, args, context) {
  return context.prisma.user.findOne({
    where: {id: parent.id}
  }).groups();
}

module.exports = {
  rescueTimeData,
  groups,
};