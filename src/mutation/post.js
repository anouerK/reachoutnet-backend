// const { GraphQLError } = require("graphql");
const { isauthenticated } = require("../../middleware/userpermission");

const post_mutation = {
    createPost: async (_, { input }, { dataSources, req }) => {
        const Post = dataSources.postAPI;
        // const { author, authorType } = input;
        const user = await isauthenticated()(req);
        input.authorType = "users";
        input.author = user.id;
        // Check if the author exists in the corresponding collection
        /*
        let authorExists;
        if (authorType === "User") {
            authorExists = await dataSources.userAPI.findOne({ _id: author });
        } else if (authorType === "Association") {
            authorExists = await dataSources.associationAPI.findOne({ _id: author });
        }

        if (!authorExists) {
            throw new Error(`The ${authorType} with id ${author} does not exist`);
        } */
        const saved_post = await Post.createPost(input);
        return saved_post;
    }
};
module.exports = post_mutation;
