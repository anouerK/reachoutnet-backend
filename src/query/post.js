/* eslint-disable no-unused-vars */
const { isauthenticated, userpermission, authorize } = require("../../middleware/userpermission");
const { GraphQLError } = require("graphql");
const Post = require("../../datasources/post");
const User = require("../../datasources/user");

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
        // await isauthenticated()(req);

        const user = await dataSources.userAPI.findOnebyId(id);

        if (!user) { throw new GraphQLError("User Not FOUND."); }

        const posts = await dataSources.postAPI.findPostsbyAuthor("users", id);
        // console.log(posts);
        return posts;
    },
    post: async (_, { id }, { dataSources, req }) => {
        const post = await dataSources.postAPI.findOnebyId(id);
        return post;
    },

    postById: async (_, { Postid }, { dataSources, req }) => {
        try {
            const post = await Post.findById(Postid);
            const authors = [];
            const User = dataSources.userAPI;
            const Association = dataSources.associationAPI;

            const sortedComments = post.comments.sort((a, b) => b.createdAt - a.createdAt);

            for (const comment of sortedComments) {
                if (comment.authorType === "users") {
                    const user = await User.findOnebyId(comment.author.toString());
                    const author = {
                        userr: user,
                        comment: comment.content,
                        createdAt: comment.createdAt
                    };
                    authors.push(author);
                } else if (comment.authorType === "associations") {
                    const association = await Association.findOnebyId(comment.author.toString());
                    const author = {
                        associationn: association,
                        comment: comment.content,
                        createdAt: comment.createdAt
                    };
                    authors.push(author);
                }
            }
            return authors;
        } catch (error) {
            console.error(error);
            throw new Error("Error while getting post and user comments");
        }
    }
};

module.exports = post_query;
