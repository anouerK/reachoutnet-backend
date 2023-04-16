/* eslint-disable no-unused-vars */
const { isauthenticated, userpermission, authorize } = require("../../middleware/userpermission");
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
    post: async (_, { id }, { dataSources, req }) => {
        const post = await dataSources.postAPI.findOnebyId(id);
        return post;
    }
};

module.exports = post_query;
