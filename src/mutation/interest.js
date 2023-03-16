const { GraphQLError } = require("graphql");

const interest_mutation = {
    addInterest: async (_, { id, nameInterest, description }, { dataSources, req }) => {
        // await authorize(userpermission.POST_MODULE_CRUDS)(req);
        const Interest = dataSources.userAPI;
        const interest = {
            id,
            nameInterest,
            description
        };
        const savedInterest = await Interest.createInterest(interest);

        return savedInterest;
    },
    deleteInterest: async (_, { id }, { dataSources, req }) => {
        try {
            // await authorize(userpermission.POST_MODULE_CRUDS)(req);
            const Interest = dataSources.userAPI;

            const interest = await Interest.deleteInterest(id);
            if (!interest) {
                throw new GraphQLError("Interest not found");
            }
            console.log(interest);
            return interest;
        } catch (error) {
            console.error(error);
            throw new GraphQLError("Failed to delete Interest");
        }
    },
    updateInterest: async (_, args, { dataSources, req }) => {
        const User = dataSources.userAPI;
        const { id, ...updateData } = args;
        const existingInterest = await User.getInterest(id);
        if (!existingInterest) {
            throw new GraphQLError("Interest not found");
        }
        const interest = await User.updateInterest(id, updateData);

        return interest;
    }
};
module.exports = interest_mutation;
