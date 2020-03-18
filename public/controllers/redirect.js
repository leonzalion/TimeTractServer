module.exports = (req, res) => {
  const {code} = req.query;
  let redirectUrl = `https://auth.expo.io/@leonzalion/timetract/`;
  if (code) redirectUrl += `?code=${code}`;
  res.redirect(redirectUrl);
};