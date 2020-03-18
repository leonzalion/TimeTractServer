module.exports = (req, res) => {
  const {app_url} = req.query;

  const url = "https://www.rescuetime.com/oauth/authorize?" +
    `client_id=${process.env.RT_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent('https://timetract.herokuapp.com/')}` +
    `&response_type=code`;
  console.log(url);
  console.log(app_url);

  res.redirect(url);
};