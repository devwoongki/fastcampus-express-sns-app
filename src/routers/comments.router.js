const express = require('express');
const { checkAuthenticated , checkCommentOwnerShip} = require('../middleware/auth');
const router = express.Router({
    mergeParams :true
});

const Post = require('../models/posts.model');
const Comment = require('../models/comments.model');

module.exports = router;


router.post('/', checkAuthenticated, (req, res) => {
    Post.findById(req.params.id).then((post) => {
        Comment.create(req.body).then((comment) => {
            comment.author.id = req.user._id;
            comment.author.username = req.user.username;
            comment.save();
        
            // 포스트에 댓글 데이터 넣어주기
            post.comments.push(comment);
            post.save();
            req.flash('success', '댓글이 잘 생성되었습니다.');
            res.redirect('back');
        }).catch((err) => {
            req.flash('error', '댓글을 생성 중 에러가 발생했습니다.');
            res.redirect('back');
        })
    }).catch((err) => {
        req.flash('error', '댓글을 생성 중 포스트를 찾지 못했거나 에러가 발생했습니다.');
        res.redirect('back');
    });
})


router.delete('/:commentId', checkCommentOwnerShip, (req, res) => {
    Comment.findByIdAndDelete(req.params.commentId).then( comment => {
        req.flash('success', '댓글을 삭제했습니다');
        res.redirect('back');
    }).catch((err) => {
        req.flash('error', '댓글을 삭제 중 에러가 발생했습니다.');
        res.redirect('back');
    });
})




router.get('/:commentId/edit', checkCommentOwnerShip, (req, res) => {
    Post.findById(req.params.id).then( post => {
        res.render('comments/edit', {
            post:post,
            comment: req.comment
        })
     
    }).catch((err) => {
        req.flash('error', '댓글에 해당하는 게시글이 없거나 에러가 발생했습니다.');
        res.redirect('back');
    });
})

router.put('/:commentId', checkCommentOwnerShip, (req, res) => {
    Comment.findByIdAndUpdate(req.params.commentId, req.body).then( comment => {
        req.flash('success', '댓글을 수정했습니다');
        res.redirect('/posts');
    }).catch((err) => {
        req.flash('error', '댓글을 수정 중 에러가 발생했습니다.');
        res.redirect('back');
    });
})

