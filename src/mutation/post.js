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
    }
};
module.exports = post_mutation;
