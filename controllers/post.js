import Post from "../Model/Post.js";
import User from "../Model/User.js";
import cloudinary from "cloudinary";

export const createpost = async (req, res) => {
  try {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "Posts",
    });
    const newPostData = {
      caption: req.body.caption,
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
      owner: req.user._id,
    };
    const post = await Post.create(newPostData);
    const user = await User.findById(req.user._id);

    user.posts.unshift(post._id);

    await user.save();

    res.status(201).json({
      success: true,
      message:"Post Created"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "UnAuthorized",
      });
    }

    await cloudinary.v2.uploader.destroy(post.image.public_id)

    await post.deleteOne();

    const user = await User.findById(req.user._id);
    const index = user.posts.indexOf(req.params.id);

    user.posts.splice(index, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Post Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const likeAndUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.likes.includes(req.user._id)) {
      const index = post.likes.indexOf(req.user._id);

      post.likes.splice(index, 1);

      await post.save();

      res.status(200).json({
        success: true,
        message: "Post Unliked",
      });
    } else {
      post.likes.push(req.user._id);

      res.status(200).json({
        success: true,
        message: "Post Liked",
      });

      await post.save();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in like or dislike controller" + error.message,
    });
  }
};

export const getPostOfFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const posts = await Post.find({
      owner: {
        $in: user.following,
      },
    }).populate("owner likes comments.user");

    res.status(200).json({
      success: true,
      posts: posts.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while getPostOfFollowing controller" + error.message,
    });
  }
};

export const updateCaption = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(400).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    post.caption = req.body.caption;

    await post.save();

    res.status(200).json({
      success: true,
      message: "Caption Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while updating caption" + error.message,
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    let commentindex = -1;

    //Checking if comment already exists
    post.comments.forEach((item, index) => {
      if (item.user.toString() === req.user._id.toString()) {
        commentindex = index;
      }
    });

    if (commentindex !== -1) {
      post.comments[commentindex].comment = req.body.comment;
      await post.save();

      return res.status(200).json({
        success: true,
        message: "Comment Updated",
      });
    } else {
      post.comments.push({
        user: req.user._id,
        comment: req.body.comment,
      });
      await post.save();
      return res.status(200).json({
        success: true,
        message: "Comment Added",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while Adding comments" + error.message,
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(500).json({
        success: false,
        message: "Post not found",
      });
    }

    //Checking if Owner wants to delete
    if (post.owner.toString() === req.user._id.toString()) {
      if (!req.body.commentId) {
        return res.status(400).json({
          success: false,
          message: "Comment not found",
        });
      }
      post.comments.forEach((item, index) => {
        if (item._id.toString() === req.body.commentId.toString()) {
          return post.comments.splice(index, 1);
        }
      });
      await post.save();

      return res.status(200).json({
        success: true,
        message: "Selected Comment has been deleted",
      });
    } else {
      post.comments.forEach((item, index) => {
        if (item.user.toString() === req.user._id.toString()) {
          return post.comments.splice(index, 1);
        }
      });

      await post.save();

      return res.status(200).json({
        success: true,
        message: "Your comment has been deleted",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
