const express = require('express');
const path = require('path');
const {default : mongoose} = require('mongoose');
const User = require('./models/users.model');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');

const config = require('config');
const mainRouter = require('./routers/main.router');
const usersRouter = require('./routers/users.router');
const postsRouter = require('./routers/posts.router');
const commentsRouter = require('./routers/comments.router');
const profileRouter = require('./routers/profile.router');
const likeRouter = require('./routers/likes.router');
const friendsRouter = require('./routers/friends.router');
const serverConfig = config.get('server');
const passport = require('passport');
const flash = require('connect-flash');

const port = serverConfig.port;

require('dotenv').config();


const app = express();

app.use(cookieSession({
    name: 'cookie-session-name',
    keys: [process.env.COOKIE_ENCRYPTION_KEY]
}));


// register regenerate & save after the cookieSession middleware initialization
app.use(function (request, response, next) {
    if (request.session && !request.session.regenerate) {
        request.session.regenerate = (cb) => {
            cb()
        }
    }
    if (request.session && !request.session.save) {
        request.session.save = (cb) => {
            cb()
        }
    }
    next()
})

app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(methodOverride('_method'));
//view engine config

app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');



mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB')
})
.catch((err) => {
    console.log(err);
});

app.use(express.static(path.join(__dirname,'public')));

app.get('/send', (req, res) => {
    req.flash('post success', '포스트가 생성되었습니다.');
    res.redirect('/receive')
})

app.get('/receive', (req, res) => {
    res.send(req.flash('post success')[0]);
})


app.use((req, res, next) => {
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    res.locals.currentUser = req.user;
    next();
})


app.use('/', mainRouter);
app.use('/auth',usersRouter);
app.use('/posts',postsRouter);
app.use('/posts/:id/comments',commentsRouter);
app.use('/profile/:id',profileRouter);
app.use('/friends',friendsRouter);
app.use('/posts/:id/like',likeRouter);

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send(err.message || "err occured");
})

app.listen(port, () => { 
    console.log(`Server running on port ${port}`);
});

