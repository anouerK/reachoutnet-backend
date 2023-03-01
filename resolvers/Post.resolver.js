/* eslint-disable complexity */
const Post = require("../models/Gestion_Posts/Post");
const Comment = require("../models/Gestion_Posts/Comment");
const Like = require("../models/Gestion_Posts/Like");


const postresolvers = {
  Query:{
    // eslint-disable-next-line no-unused-vars
    posts: async(_,__,{req})=>{
      const posts = await Post.find();
      return posts;
    },
    // eslint-disable-next-line no-unused-vars
    post: async (_, { _id }, { req }) => {
      const post = await Post.findById(_id);
      return post;
    },
    // eslint-disable-next-line no-unused-vars
    comments: async(_,__,{req})=>{
      const comments = await Comment.find();
      return comments;
    },
    // eslint-disable-next-line no-unused-vars
    comment: async (_, { _id }, { req }) => {
      const comment = await Comment.findById(_id);
      return comment;
    },
    // eslint-disable-next-line no-unused-vars
    likes: async(_,__,{req})=>{
      const likes = await Like.find();
      return likes;
    },
    // eslint-disable-next-line no-unused-vars
    like: async (_, { _id }, { req }) => {
      const like = await Like.findById(_id);
      return like;
    },
  },
  Mutation:{
    // eslint-disable-next-line no-unused-vars
    addPost: async(_,{authorPost, authorTypePost, content, AttachedFiles,tags} , {req}) =>
    {
      const post = new Post({
        authorPost, 
        authorTypePost,
        content,
        AttachedFiles, 
        tags
      });

      await post.save();
      return post;

    },
    // eslint-disable-next-line no-unused-vars
    deletePost: async (_, { _id }, { req }) => {
      try {
      //  await authorize(userpermission.POST_MODULE_CRUDS)(req);
        const post = await Post.findByIdAndDelete(_id);
        if (!post) {
          throw new Error("Post not found");
        }
        return post;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to delete post");
      }
    },

  },


};


module.exports = postresolvers;