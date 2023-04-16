/* eslint-disable no-unused-vars */
const { isauthenticated, userpermission, authorize } = require("../../middleware/userpermission");
const post_query = {
    posts: async (_, __, { dataSources, req }) => {
        const posts = await dataSources.postAPI.getAllPosts();
        return posts;
    },
    post: async (_, { id }, { dataSources, req }) => {
        const post = await dataSources.postAPI.findOnebyId(id);
        return post;
    }
};

module.exports = post_query;
