const cloudinary = require('cloudinary').v2;
const getUser = require('../getUser');
const sightengine = require('sightengine')(process.env.SIGHTENGINE_ID, process.env.SIGHTENGINE_PASS);
const to = require('await-to-js').default;

module.exports = async (req, res) => {
  const [userError, user] = await to(getUser(req));
  if (userError) return await res.status(401).json(userError);

  const username = user.username;
  const {avatarBase64} = req.body;

  const [resultError, result] = await to(sightengine.check(['nudity','wad','offensive','text'])
  .set_bytes(avatarBase64, 'avatar.png'));

  if (resultError) return await res.status(500).json(resultError);
  if (result.status !== 'success') return await res.status(500).json(result);

  if (result.weapon > 0.5 || result.alcohol > 0.5 ||
    result.drugs > 0.5 || result.nudity.safe < 0.5 ||
    result.offensive > 0.5) {
    return await res.status(500).json({
      message: 'Image deemed inappropriate. (It should not contain questionable content ' +
               'and should not contain text.)'
    });
  }

  const [uploadError, uploadResult] = await to(cloudinary.uploader
  .upload(`data:image/jpg;base64,${avatarBase64}`, {
    public_id: username,
    overwrite: true
  }));

  if (uploadError) return await res.status(500).json(uploadError);
  await res.json(uploadResult);
};