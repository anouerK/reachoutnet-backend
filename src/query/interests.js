const { GraphQLError } = require("graphql");
const { authorize, userpermission } = require("../../middleware/userpermission");
const { isValidObjectId } = require("mongoose");
const interest_query = {
    interestId: async (_, { id }, { dataSources, req }) => {
        const Interest = dataSources.userAPI;
        const interest = await Interest.getInterestlById(id);
        return interest;
    },
    nameInterest: async (_, { name }, { dataSources, req }) => {
        const Interest = dataSources.userAPI;
        const interest = await Interest.getInterestByName(name);
        return interest;
    },
    interests: async (_, __, { dataSources, req }) => {
        const Interest = dataSources.userAPI;
        const interests = await Interest.getAllInterest();
        return interests;
    },
    findUserInterests: async (_, { id }, { dataSources, req }) => {
        if (!isValidObjectId(id)) throw new GraphQLError("Invalid user id");
        await authorize(userpermission.POST_MODULE_CRUDS)(req);

        const user = await dataSources.userAPI.findOneUserandPopulateInterests(id);

        if (!user) throw new GraphQLError("User not found");
        return user.interests;
    }
};
module.exports = interest_query;
