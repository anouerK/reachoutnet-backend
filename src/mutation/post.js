// const { GraphQLError } = require("graphql");
const { isauthenticated } = require("../../middleware/userpermission");

const post_mutation = {
    createPost: async (_, { input }, { dataSources, req }) => {
        const Post = dataSources.postAPI;
        const user = await isauthenticated()(req);
        input.authorType = "users";
        input.author = user.id;
        const saved_post = await Post.createPost(input);
        return saved_post;
    },
    deletePost: async (_, { postId }, { dataSources, req }) => {
        const Post = dataSources.postAPI;
        const post = await Post.findByIdAndDelete(postId);
        if (!post) throw new Error("Post not found.");
        return post;
    },
    userlikepost: async (_, { postId }, { dataSources, req }) => {
        // Authenticate the user
        const user = await isauthenticated()(req);
        const Post = dataSources.postAPI;
        // Check if the post exists
        const post = await Post.getPost(postId);
        if (!post) {
            throw new Error("Post not found.");
        }
        // Check if the user has already liked the post
        const isLiked = post.likes.some(
            (like) =>
                like.author.toString() === user.id.toString() &&
                like.authorType === "users"
        );

        // If the user has already liked the post, remove the like
        if (isLiked) {
            post.likes = post.likes.filter(
                (like) =>
                    like.author.toString() !== user.id.toString() ||
                    like.authorType !== "users"
            );
        } else {
            // If the user hasn't liked the post, add a new like
            post.likes.push({
                author: user.id,
                authorType: "users"
            });
        }

        // Save the post
        await post.save();
        return true;
    }

};
module.exports = post_mutation;
