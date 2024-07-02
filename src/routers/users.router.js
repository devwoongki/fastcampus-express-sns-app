const express = require('express');
const usersRouter = express.Router();
const passport = require('passport');
const User = require('../models/users.model');
const sendMail = require('../mail/mail');

usersRouter.post('/login',(req,res, next) => {
    passport.authenticate("local" , (err, user, info) => {
        if(err){
            return next(err);
        }

        if(!user){
            return res.json({msg: info});
        }

        req.logIn(user, function (err){
            if(err){ return next(err); }

            res.redirect('/posts');
        })
    })(req, res, next)
})

usersRouter.post('/logout',(req,res,next) =>{
    req.logOut(function (err) {
        if(err){ return next(err); }
        res.redirect('/login');
    })
})

usersRouter.post('/signup', async (req,res) => {
    //user객체 생성
    console.log('signup');
    const user = new User(req.body);
    
    try{
        //user컬렉션에 유저 저장
        await user.save();
        //email 보내기
        // sendMail('rladndrl9@naver.com', 'woongki', 'welcome');
        res.redirect('/login');
    }catch(error){
        console.log(error);
        res.redirect('/signup');
    }

})


usersRouter.get('/google', passport.authenticate('google'));
usersRouter.get('/google/callback', passport.authenticate('google',{
    successReturnToOrRedirect: '/posts',
    failureRedirect: '/login',
}));

usersRouter.get('/kakao', passport.authenticate('kakao'));
usersRouter.get('/kakao/callback', passport.authenticate('kakao',{
    successReturnToOrRedirect: '/',
    failureRedirect: '/login',
}));

module.exports = usersRouter;