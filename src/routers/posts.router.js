const express = require('express');
const {checkAuthenticated} = require('../middleware/auth');
const Post = require('../models/posts.model');
const router = express.Router();
const Comment = require('../models/comments.model');
const multer = require('multer');
const path = require('path');

const storageEngine = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, '../public/assets/images'))
    },
    filename: (req, file, callback) =>{
        callback(null, file.originalname);
    }
})

const upload = multer({storage: storageEngine}).single('image')

router.post('/', checkAuthenticated, upload, (req, res, next) => {
    let desc = req.body.desc;
    let image = req.file ? req.file.filename : "";

    Post.create({
        iamge:image,
        description: desc,
        author: {
            id:req.user._id,
            username: req.user.username
        }
    }).then(post => {
        req.flash('success', '포스트 생성 성공');
        res.redirect("back");
        // res.redirect("posts");
    }).catch(err => {
        req.flash('error', '포스트 생성 실패');
        res.redirect("back");
        // next(err);
    })

})

router.get('/', checkAuthenticated, (req, res) => {
    Post.find()
    .populate('comments')
    .sort({createdAt: -1})
    .exec().then(posts =>{
        console.log(posts);
        res.render('posts', {posts: posts});
    }).catch(err => {
        console.log(err);
    })
});


module.exports = router;