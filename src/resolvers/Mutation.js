const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {APP_SECRET, getUserId} = require('../utils');
const fetch = require('node-fetch');
const cloudinary = require('cloudinary').v2;
const to = require('await-to-js').default;
const sightengine = require('sightengine')(process.env.SIGHTENGINE_ID,
  process.env.SIGHTENGINE_PASS);
const concat = require('concat-stream');

async function register(parent, {input}, context) {
  const password = await bcrypt.hash(input.password, 10);
  const user = await context.prisma.user.create({
    data: {
      username: input.username,
      password
    }
  });
  const token = jwt.sign({userId: user.id}, APP_SECRET);
  return {token, user};
}

async function login(parent, {input}, context) {
  const user = await context.prisma.user.findOne({
    where: {username: input.username}
  });
  if (!user) throw new Error('No such user found.');
  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) throw new Error('Invalid password');
  const token = jwt.sign({userId: user.id}, APP_SECRET);
  return {token, user};
}

async function connectUserToRescueTime(parent, {input}, context) {
  const userId = getUserId(context);
  const tokenUrl = 'https://www.rescuetime.com/oauth/token';
  const response = await fetch(tokenUrl, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: process.env.RT_CLIENT_ID,
      client_secret: process.env.RT_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: input.authCode,
      redirect_uri: 'https://timetract.herokuapp.com/'
    })
  });
  const result = await response.json();
  if (result.error) {
    throw new Error(result.error_description);
  }

  const {access_token: accessToken} = result;

  await context.prisma.user.update({
    data: {accessToken},
    where: {id: userId}
  });

  return accessToken;
}

async function disconnectUserFromRescueTime(parent, args, context) {
  const userId = getUserId(context);
  await context.prisma.user.update({
    where: {id: userId},
    data: {accessToken: null}
  });
  return null;
}

async function leaveGroup(parent, {input}, context) {
  const userId = getUserId(context);
  await context.prisma.user.update({
    where: {id: userId},
    data: {
      groups: {
        disconnect: {id: input.groupId}
      }
    }
  });
  return context.prisma.group.findOne({
    where: {id: input.groupId}
  });
}

async function joinGroup(parent, {input}, context) {
  const userId = getUserId(context);
  const group = await context.prisma.group.update({
    where: {id: input.groupId},
    data: {
      members: {
        connect: [
          {id: userId}
        ]
      }
    }
  });
  await context.prisma.user.update({
    where: {id: userId},
    data: {
      groups: {
        connect: [
          {id: input.groupId}
        ]
      }
    }
  });
  return group;
}

async function createGroup(parent, {input}, context) {
  const userId = getUserId(context);
  return context.prisma.group.create({
    data: {
      name: input.name,
      description: input.description,
      blurb: input.blurb,
      members: {connect: {id: userId}}
    }
  });
}

async function updateUserAvatar(parent, {input}, context) {
  const userId = getUserId(context);
  const user = await context.prisma.user.findOne({
    where: {id: userId}
  });
  const { createReadStream } = await input.image;
  const stream = createReadStream();

  return new Promise((resolve, reject) => {
    const concatStream = concat(gotImage);
    stream.on('error', handleError);
    stream.pipe(concatStream);

    async function gotImage(imageBuffer) {
      const base64 = imageBuffer.toString('base64');
      const [checkError, result] = await to(sightengine.check(['nudity', 'wad', 'offensive', 'text'])
      .set_bytes(base64, 'avatar.png'));
      if (checkError) throw new Error("Couldn't check image: " + checkError);
      if (result.status !== 'success') throw new Error("Couldn't check image.");
      if (result.weapon > 0.5 || result.alcohol > 0.5 ||
        result.drugs > 0.5 || result.nudity.safe < 0.5 ||
        result.offensive > 0.5) {
        throw new Error("Image deemed inappropriate.");
      }

      const [uploadError, uploadResult] = await to(cloudinary.uploader
      .upload(`data:image/jpg;base64,${base64}`, {
        public_id: await user.username(),
        overwrite: true
      }));

      if (uploadError) throw new Error("Failed to upload image.");
      const newUrl = uploadResult.secure_url;
      await context.prisma.user.update({
        data: {avatarUrl: newUrl},
        where: {id: userId}
      });

      return resolve(newUrl);
    }

    function handleError(err) {
      console.error(err);
      return reject(err);
    }
  });
}

async function deleteUserAvatar(parent, args, context) {
  const userId = getUserId(context);
  await context.prisma.user.update({where: {id: userId}, data: {
    avatarUrl: null
  }});
  return null;
}

module.exports = {
  register,
  login,
  connectUserToRescueTime,
  disconnectUserFromRescueTime,
  joinGroup,
  leaveGroup,
  createGroup,
  updateUserAvatar,
  deleteUserAvatar
};
