/* eslint-disable no-unused-vars */
// const { GraphQLError } = require("graphql");
const { isauthenticated, authorize_association } = require("../../middleware/userpermission");
const { GraphQLError } = require("graphql");
const { association_permission } = require("../../middleware/userpermission");
const post_mutation = {
    createPost: async (_, { input }, { dataSources, req }) => {
        const Post = dataSources.postAPI;
        const user = await isauthenticated()(req);
        input.authorType = "users";
        input.author = user.id;
        const saved_post = await Post.createPost(input);
        return saved_post;
    },
    createPostAssociation: async (_, { input }, { dataSources, req }) => {
        const Post = dataSources.postAPI;
        // const user = await isauthenticated()(req);
        await authorize_association(association_permission.ASSOCIATION_MANAGEMENT, input.author)(req);
        input.authorType = "associations";
        const association = await dataSources.associationAPI.findOnebyId(input.author);
        if (!association) {
            throw new GraphQLError("Association not found");
        }
        const saved_post = await Post.createPost(input);
        return saved_post;
    },
    deletePost: async (_, { id }, { dataSources, req }) => {
        const Post = dataSources.postAPI;
        const post = await Post.deletePost(id);
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
    },
    addComment: async (_, { postId, content }, { dataSources, req }) => {
        const Post = dataSources.postAPI;
        const user = await isauthenticated()(req);
        const post = await Post.getPost(postId);
        if (!post) {
            throw new Error("Post not found.");
        }
        // eslint-disable-next-line no-unused-vars
        const valid = await dataSources.googlePerspectiveAPI.analyzeComment(content);

        if (valid === false) {
            const comment = {
                content,
                author: user.id,
                authorType: "users",
                createdAt: new Date()
            };
            post.comments.push(comment);
            await post.save();
            return true;
        }
        const toxicity = JSON.stringify(valid.data.attributeScores.TOXICITY.spanScores[0].score.value, null, 2);
        const insult = JSON.stringify(valid.data.attributeScores.INSULT.spanScores[0].score.value, null, 2);
        if (toxicity > 0.5 || insult > 0.5) {
            return false;
        } else {
            const comment = {
                content,
                author: user.id,
                authorType: "users",
                createdAt: new Date()
            };
            post.comments.push(comment);
            await post.save();
            return true;
        }
    },
    deleteCommment: async (_, { postId, commentId }, { dataSources, req }) => {
        const Post = dataSources.postAPI;
        await isauthenticated()(req);
        const post = await Post.getPost(postId);
        if (!post) {
            throw new Error("Post not found.");
        }
        const comment = post.comments.id(commentId);
        if (!comment) {
            throw new Error("Comment not found");
        }
        comment.remove();
        await post.save();
        return post;
    },
    moderateComment: async (_, { comment }, { dataSources, req }) => {
        try {
            // eslint-disable-next-line no-unused-vars
            const response = await dataSources.myAPI.createModeration(comment);
            return "";
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    analyzeCommentGoogle: async (_, { comment }, { dataSources }) => {
        // eslint-disable-next-line no-unused-vars
        const valid = await dataSources.googlePerspectiveAPI.analyzeComment(comment);
        const toxicity = JSON.stringify(valid.data.attributeScores.TOXICITY.spanScores[0].score.value, null, 2);
        const insult = JSON.stringify(valid.data.attributeScores.INSULT.spanScores[0].score.value, null, 2);
        const threat = JSON.stringify(valid.data.attributeScores.THREAT.spanScores[0].score.value, null, 2);
        if (toxicity > 0.5 || insult > 0.5) {
            console.log(toxicity, insult, threat);
        }

        return true;
    }
};
module.exports = post_mutation;
