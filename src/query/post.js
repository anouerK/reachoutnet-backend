/* eslint-disable no-unused-vars */
const { isauthenticated, userpermission, authorize } = require("../../middleware/userpermission");
const { GraphQLError } = require("graphql");
const post_query = {
    users_posts: async (_, __, { dataSources, req }) => {
        const posts = await dataSources.postAPI.findPostsandAuthors("users");

        return posts;
    },
    get_user_posts: async (_, { __ }, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        const posts = await dataSources.postAPI.findPostsbyAuthor("users", user._id);
        return posts;
    },
    get_user_posts_by_id: async (_, { id }, { dataSources, req }) => {
        await isauthenticated()(req);

        const user = await dataSources.userAPI.findOnebyId(id);

        if (!user) { throw new GraphQLError("User Not FOUND."); }

        const posts = await dataSources.postAPI.findPostsbyAuthor("users", id);
        // console.log(posts);
        return posts;
    },
    post: async (_, { id }, { dataSources, req }) => {
        const post = await dataSources.postAPI.findOnebyId(id);
        return post;
    }
};

module.exports = post_query;
