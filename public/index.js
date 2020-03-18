require('dotenv').config();
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();

const bodyParser = require('body-parser');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({limit: '60mb', extended: true}));
app.use(bodyParser.urlencoded({extended: true}));

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

const mongoose = require('mongoose');

const dbPassword = process.env.DB_PASSWORD;
mongoose.connect(`mongodb+srv://timetract_app:${dbPassword}@timetract-d9dgb.mongodb.net/test`, {useUnifiedTopology: true, useNewUrlParser: true});

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const connectUser = require('./controllers/users/connect');
app.get('/users/connect', connectUser);

const getUserToken = require('./controllers/users/token');
app.post('/users/token', getUserToken);

const getUser = require('./controllers/users/get');
app.get('/users', getUser);

const patchUser = require('./controllers/users/patch');
app.patch('/users', patchUser);

const createUser = require('./controllers/users/create');
app.post('/users', createUser);

const uploadUserAvatar = require('./controllers/users/avatar');
app.post('/users/avatar', uploadUserAvatar);

const getRTData = require('./controllers/users/rtdata');
app.get('/users/rtdata', getRTData);

const createGroup = require('./controllers/groups/create');
app.post('/groups', createGroup);

const getGroup = require('./controllers/groups/get');
app.get('/groups/:id', getGroup);

const getAllGroups = require('./controllers/groups/getAll');
app.get('/groups', getAllGroups);

const joinGroup = require('./controllers/groups/join');
app.post('/groups/:id/join', joinGroup);

const leaveGroup = require('./controllers/groups/leave');
app.post('/groups/:id/leave', leaveGroup);

const redirectUser = require('./controllers/redirect');
app.get('/', redirectUser);

app.get('/privacy_policy', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'views/privacy_policy.html'));
});