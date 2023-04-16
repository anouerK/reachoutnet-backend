const Post = require("./post");
class PostApi {
    constructor () {
        this.model_post = Post;
    }

    getAllPosts () {
        return this.model_post.find({});
    }

    createPost (Post) {
        return this.model_post.create(Post);
    }

    updatePost (id, Post) {
        return this.model_post.findByIdAndUpdate(id, Post, { upsert: true, new: true });
    }

    deletePost (id) {
        return this.model_post.findByIdAndDelete(id);
    }
}

module.exports = PostApi;
