const Post = require("./post");
// Retrieve the User model

// Retrieve the Association model
/*
function clone (a) {
    return JSON.parse(JSON.stringify(a));
} */
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

    findPostsandAuthors (authorType) {
        return this.model_post.find({ authorType })
            .sort({ createdAt: -1 })
            .populate({
                path: "author"
            });
    }

    findPostsbyAuthor (authorType, author) {
        return this.model_post.find({ authorType, author })
            .sort({ createdAt: -1 })
            .populate({
                path: "author"
            });
    }

    /*
    findPostsWithAuthors () {
        return this.model_post
            .find({})
            .populate({
                path: "author"
            })
            .then((posts) => {
                return posts.map((post) => {
                    // eslint-disable-next-line prefer-const
                    let clone_post = clone(post);
                    clone_post.id = clone_post._id;
                    const user = clone(post.author);
                    clone_post.author = {};
                    clone_post.author.user = user;
                    clone_post.author.user.id = clone_post.author.user._id;
                    return clone_post;
                });
            });
    } */
}

module.exports = PostApi;
