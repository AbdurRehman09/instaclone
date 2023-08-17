const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin  = require('../middleware/requireLogin')
const Post =  mongoose.model("Post")
const User = mongoose.model("User")


    router.get('/user/:id', async (req, res) => {
        try {
          const user = await User.findOne({ _id: req.params.id }).select("-password");
          
          if (!user) {
            return res.status(404).json({ error: "User not found" });
          }
      
          const posts = await Post.find({ postedBy: req.params.id })
            .populate("postedBy", "_id name")
            .exec();
      
          res.json({ user, posts });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      })
    
      
      router.put('/follow', requireLogin, async (req, res) => {
        try {
          const FollowId = req.body.followId;
      
          // Update the followers array of the user being followed
          const updatedFollowedUser = await User.findByIdAndUpdate(FollowId,
            { $push: { followers: req.user._id } },
            { new: true }
          );
      
          if (!updatedFollowedUser) {
            return res.status(404).json({ error: "User not found" });
          }
      
          // Update the following array of the current user
          const updatedCurrentUser = await User.findByIdAndUpdate(
            req.user._id,
            { $push: {following:FollowId} },
            { new: true }
          )
          .select("-password");
      
          res.json(updatedCurrentUser);
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });
      
    
    
      router.put('/unfollow', requireLogin, async (req, res) => {
        try {
          const unfollowId = req.body.unfollowId;
      
          // Update the followers array of the user being unfollowed
          const updatedUnfollowedUser = await User.findByIdAndUpdate(
            unfollowId,
            { $pull: { followers: req.user._id } },
            { new: true }
          );
      
          if (!updatedUnfollowedUser) {
            return res.status(404).json({ error: "User not found" });
          }
      
          // Update the following array of the current user
          const updatedCurrentUser = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { following: unfollowId } },
            { new: true }
          )
          .select("-password");
      
          res.json(updatedCurrentUser);
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });


      router.put('/updatepic', requireLogin, async (req, res) => {
        try {
          const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { pic: req.body.pic } },
            { new: true }
          );
      
          if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
          }
      
          res.json(updatedUser);
        } catch (err) {
          res.status(500).json({ error: "Unable to update profile picture" });
        }
      });
      
      
      
module.exports = router