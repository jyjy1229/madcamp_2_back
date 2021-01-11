const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const Post = require('../models/post.js');

// GET ALL (ONLY FOR DEBUGGING)
router.get('/', async (req, res) => {
    try {
        const output = await User.find();
        res.status(200).json(output);
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

// GET Specific user
router.get('/:user_id', async (req, res) => {
    try {
        const output = await User.findById(req.params.user_id);
        res.status(200).json(output);
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

// GET following friends info
router.get('/:user_id/following', async (req, res) => {
    try {
        console.log(req.params.user_id);
        const currentUser = await User.findById(req.params.user_id);
        let followingUserArray = [];
        console.log(currentUser.followingIds);

        for (followingId of currentUser.followingIds) {
            let followingUser = await User.findById(followingId, '-userId -password -signUpDate -followingIds');
            followingUserArray.push(followingUser);
        }
        res.status(200).json(
            followingUserArray
        );
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

// user ADD
router.post('/signup', async (req, res) => {
    console.log(req.body);
    const existUser = await User.find({ isFacebookUser: req.body.isFacebookUser, userId: req.body.userId })
    try {
        if(existUser.length > 0){
            res.status(404).send("User already exist");
        }
        else{
            let newUser = new User(req.body);
            const output = await newUser.save();
            res.status(200).json(output);
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
})

// login request
router.post('/login', async (req, res) => {
    try {
        console.log(req.body.isFacebookUser, req.body.userId, req.body.password);
        let currentUser
        if(!req.body.isFacebookUser){
            currentUser = await User.findOne({isFacebookUser: req.body.isFacebookUser, userId: req.body.userId, password: req.body.password});
        }
        else{
            currentUser = await User.findOne({isFacebookUser: req.body.isFacebookUser, userId: req.body.userId});
        }
        console.log(currentUser);
        if(currentUser === null) res.status(404).send("User not found");
        else res.status(200).json(currentUser);
    } catch (error) {
        res.status(500).json({ message: error });
    }
})

// Retrieve users by contact
router.post('/contact', async (req, res) => {
    console.log(req.body);
    let contactUserArray = [];
    try {
        if (Array.isArray(req.body)) {
            let contactList = req.body;
            for (contact of contactList) {
                console.log(contact);
                let contactUser = await User.findOne({ phoneNumber: contact.phoneNumber }, '-userId -password -signUpDate -followingIds');
                if (contactUser !== null)
                    contactUserArray.push(contactUser);
            }
        } else { res.status(500).send('Invalid request'); }
        res.status(200).json(contactUserArray);
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

// RETRIEVE user's posts
router.get('/:userId/posts', async (req, res) => {
    console.log(req.params.userId);
    try {
        const user = await User.findOne({ userId: req.params.userId });
        if (!user) {
            return req.status(404).send('User not found');
        }
        const posts = user.posts;
        console.log(posts);
        let postList = [];
        for (postId of posts) {
            const post = await Post.findById(postId);
            postList.push(post);
            console.log(post);
        }
        res.json(postList);

    } catch (error) {
        res.status(500).json({ message: error });
    }
});

// Add user to followinglist
router.put('/follow', async (req, res) => {
    try{
        console.log(req.body)
        let currentUser = await User.findById(req.body.id);
        currentUser.followingIds.push(req.body.followingId)
        console.log(currentUser)
        const updatedUser = await User.findByIdAndUpdate(
            currentUser._id,
            currentUser,
            function(err, result){
                if (err) {
                    res.send(err);
                }
            }
        );
        res.status(200).json(currentUser);
    } catch (error) {
        res.status(500).json({ message: error });
    }
})

// Add user to followinglist
router.delete('/unfollow/:user_id/:followingId', async (req, res) => {
    console.log(req.params)
    try{
        let currentUser = await User.findById(req.params.user_id);
        currentUser.followingIds.remove(req.params.followingId)
        console.log(currentUser)
        const updatedUser = await User.findByIdAndUpdate(
            currentUser._id,
            currentUser,
            function(err, result){
                if (err) {
                    res.send(err);
                }
            }
        );
        res.status(200).json(currentUser);
    } catch (error) {
        res.status(500).json({ message: error });
    }
})

module.exports = router;