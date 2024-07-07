const express = require('express');
const { checkAuthenticated, checkIsMe } = require('../middleware/auth');
const router = express.Router({
    mergeParams: true
});
const Post = require('../models/posts.model');
const User = require('../models/users.model');

router.get('/', checkAuthenticated, (req, res) => {
    Post.find({ "author.id": req.params.id })
        .populate('comments')
        .sort({ createdAt: -1 })
        .exec().then(posts => {
            User.findById(req.params.id).then(user =>{
                res.render('profile', {
                    posts: posts,
                    user: user
                })
            }).catch(err => {
                req.flash('error', '없는 유저 입니다.');
                res.redirect('back');
            });
        }).catch(err=>{
            req.flash('error', '게시물을 가져오는데 실패했습니다.');
            res.redirect('back');
            console.log(err);
        });
           
})

router.get('/edit', checkIsMe, (req, res) => {
    res.render('profile/edit', {
        user: req.user
    })
})


router.put('/', checkIsMe, (req, res) => {
    User.findByIdAndUpdate(req.params.id, req.body).then( () => {
        req.flash('success', '유저 데이터를 업데이트하는데 성공했습니다.');
        res.redirect('/profile/' + req.params.id);
    }).catch(err => {
        req.flash('error', '유저 데이터를 업데이트하는데 에러가 났습니다.');
        res.redirect('back');
    });
})



module.exports = router;