const { GraphQLError } = require("graphql");
const { isauthenticated } = require("../../middleware/userpermission");

const follow_mutation = {
    addFollow: async (_, { followingId, followingType }, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        const followerId = user.id;
        const followerType = "users";
        const Follow = dataSources.userAPI;
        const follow = {
            followerId,
            followerType,
            followingId,
            followingType
        };
        const savedFollow = await Follow.createFollow(follow);

        return savedFollow;
    },
    unFollow: async (_, { followingId }, { dataSources, req }) => { // delete Follow
        const user = await isauthenticated()(req);
        const id = user.id;
        try {
            // await authorize(userpermission.POST_MODULE_CRUDS)(req);
            const Follow = dataSources.userAPI;
            const follower = await Follow.getFollower(id, followingId);
            if (follower) {
                const follow = await Follow.deleteFollow(follower.id);
                if (!follow) {
                    throw new GraphQLError("Follow not found");
                }
                return follow;
            }
        } catch (error) {
            console.error(error);
            throw new GraphQLError("Failed to delete Follow");
        }
    }
};
module.exports = follow_mutation;
