const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const {auth_code} = req.body;

  const tokenUrl = "https://www.rescuetime.com/oauth/token";
  const response = await (await fetch(tokenUrl, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: process.env.RT_CLIENT_ID,
      client_secret: process.env.RT_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: auth_code,
      redirect_uri: `https://timetract.herokuapp.com/`
    })
  })).json();
  await res.json(response);
};