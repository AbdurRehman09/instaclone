const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const requiredlogin=require('../middleware/requireLogin')
const Post= mongoose.model("Post")


router.get('/allpost',requiredlogin,(req,res)=>{
    Post.find()
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})
router.get('/getsubpost',requiredlogin,(req,res)=>{
   // if postedby is in following
    Post.find({postedBy:{$in:req.user.following}})
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})
router.post('/createpost',requiredlogin,(req,res)=>{
      const{title,body,pic}=req.body
      if(!title || !body || !pic)
      {
        return res.status(422).json({error:"Please add all the feilds"})
      } 
      req.user.password=undefined
     const post=new  Post ({
           title,
           body,
           photo:pic,
           postedBy:req.user
     })
     post.save().then(result=>{
       
        res.json({post:result})
     })
     .catch(err=>{
        console.log(err)
     })
})
router.get('/mypost',requiredlogin,(req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate("postedBy","_id name")
    .then(mypost=>{
        res.json({mypost})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.put('/like', requiredlogin, async (req, res) => {
    try {
      const result = await Post.findByIdAndUpdate(
        req.body.postId,
        {
          $push: { likes: req.user._id }
        },
        {
          new: true
        }
      ).exec();
  
      res.json(result);
    } catch (err) {
      res.status(422).json({ error: err.message });
    }
  });
  
  router.put('/unlike', requiredlogin, async (req, res) => {
    try {
      const result = await Post.findByIdAndUpdate(
        req.body.postId,
        {
          $pull: { likes: req.user._id }
        },
        {
          new: true
        }
      ).exec();
  
      res.json(result);
    } catch (err) {
      res.status(422).json({ error: err.message });
    }
  });
  
  router.put('/comment', requiredlogin, async (req, res) => {
    const comment = {
      text: req.body.text,
      postedBy: req.user._id
    };
  
    try {
      const result = await Post.findByIdAndUpdate(
        req.body.postId,
        {
          $push: { comments: comment }
        },
        {
          new: true
        }
      )
        .populate("comments.postedBy", "_id name")
        .populate("postedBy", "_id name")
        .exec();
  
      res.json(result);
    } catch (err) {
      res.status(422).json({ error: err.message });
    }
  });
  
  router.delete('/deletepost/:postId', requiredlogin, async (req, res) => {
    try {
      const post = await Post.findOne({ _id: req.params.postId })
        .populate("postedBy", "_id")
        .exec();
  
      if (!post) {
        return res.status(422).json({ error: "Post not found" });
      }
  
      if (post.postedBy._id.toString() === req.user._id.toString()) {
        const result = await Post.deleteOne({ _id: req.params.postId });
        res.json(result);
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  

module.exports=router;