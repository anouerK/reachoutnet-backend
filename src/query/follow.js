/* eslint-disable complexity */
const { isauthenticated, userpermission, authorize } = require("../../middleware/userpermission");
const follow_query = {

    follow: async (_, { id2 }, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        const id1 = user.id;
        const Follow = dataSources.userAPI;
        const follower1 = await Follow.getFollower(id1, id2);
        const followingRelation1 = await Follow.getFollowingRelation(id2, id1);
        if (follower1 && followingRelation1) {
            /// console.log("User 1 and User 2 are following each other");
            return "Following";
        } else if (follower1 && !followingRelation1) {
            // console.log("User 1 is following User 2, but User 2 is not following User 1");
            return "Waiting";
        } else if (followingRelation1 && !follower1) {
            // console.log("User 2 is following User 1, but User 1 is not following User 2");
            return "Follow Back";
        } else {
            // console.log("User 1 and User 2 are not following each other");
            return "Follow";
        }
    },
    follows: async (_, { id }, { dataSources, req }) => {
        await authorize(userpermission.LOGGED)(req);
        const Follow = dataSources.userAPI;
        const followingIds = await Follow.getAllUsers();

        followingIds.forEach(async (followingId) => {
            const follower = await Follow.getFollower(id, followingId);
            const followingRelation = await Follow.getFollowingRelation(followingId, id);

            if (follower && followingRelation) {
                // followbacks.push(followingId);
                // console.log("2 users are following");
            } else if (follower && !followingRelation) {
                // following.push(followingId);
                // console.log("this user only following + unfollow");
            } else if (followingRelation && !follower) {
                // followed.push(followingId);
                // console.log("followback");
            } else {
                // The two users are not following each other
                // console.log("no follow relation between 2 users");
            }
        });
    },
    followBacks: async (_, { __ }, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        const id = user.id;
        const Follow = dataSources.userAPI;
        const followingIds = await Follow.getAllUsers();
        const followBack = [];
        for (const followingId of followingIds) {
            const follower = await Follow.getFollower(id, followingId);
            const followingRelation = await Follow.getFollowingRelation(followingId, id);
            if (followingRelation && !follower) {
                followBack.push(followingId);
            }
        }
        return followBack;
    },
    ThreefollowBacks: async (_, { __ }, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        const id = user.id;
        let counter = 0;
        const Follow = dataSources.userAPI;
        const followingIds = await Follow.getAllUsers();
        const followBack = [];
        for (const followingId of followingIds) {
            const follower = await Follow.getFollower(id, followingId);
            const followingRelation = await Follow.getFollowingRelation(followingId, id);
            if (followingRelation && !follower) {
                followBack.push(followingId);
                counter++;
                if (counter === 3) {
                    break;
                }
            }
        }
        return followBack;
    },
    following: async (_, { __ }, { dataSources, req }) => { // Return the user(s) who are followed by this user and are also following this user.
        const user = await isauthenticated()(req);
        const id = user.id;
        const Follow = dataSources.userAPI;
        const followingIds = await Follow.getAllUsers();
        const followings = [];
        for (const followingId of followingIds) {
            const follower = await Follow.getFollower(id, followingId);
            const followingRelation = await Follow.getFollowingRelation(followingId, id);
            if (followingRelation && follower) {
                followings.push(followingId);
            }
        }
        return followings;
    },
    OnlyFollowedBythisUser: async (_, { __ }, { dataSources, req }) => { // Return the user(s) who are only followed by this user
        const user = await isauthenticated()(req);
        const id = user.id;
        const Follow = dataSources.userAPI;
        const followingIds = await Follow.getAllUsers();
        const followedByThis = [];
        for (const followingId of followingIds) {
            const follower = await Follow.getFollower(id, followingId);
            const followingRelation = await Follow.getFollowingRelation(followingId, id);
            if (!followingRelation && follower) {
                followedByThis.push(followingId);
            }
        }
        return followedByThis;
    },
    NotFollowing: async (_, { __ }, { dataSources, req }) => { // Return the user(s) who are only followed by this user
        const user = await isauthenticated()(req);
        const id = user.id;
        const Follow = dataSources.userAPI;
        const followingIds = await Follow.getAllUsers();
        const NotFollowing = [];
        for (const followingId of followingIds) {
            const follower = await Follow.getFollower(id, followingId);
            const followingRelation = await Follow.getFollowingRelation(followingId, id);
            if (!followingRelation && !follower) {
                if (id.localeCompare(followingId._id)) {
                    // console.log(id + " " + followingId._id);
                    NotFollowing.push(followingId);
                }
            }
        }
        return NotFollowing;
    }
};
module.exports = follow_query;
