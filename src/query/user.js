const { isauthenticated, userpermission, authorize } = require("../../middleware/userpermission");
const graphLookup = require("../graphlookup/usergraphLookup");
const user_query = {
    users: async (_, __, { dataSources, req }) => {
        await authorize(userpermission.VIEW_USER_MODULE)(req);
        const users = await dataSources.userAPI.getAllUsers();
        return users;
    },
    usersRecommendation: async (_, { id }, { dataSources, req }) => {
        // await authorize(userpermission.VIEW_USER_MODULE)(req);
        const result = await graphLookup(id);

        return result;
    },

    user: async (_, { id }, { dataSources, req }) => {
        await authorize(userpermission.VIEW_USER_MODULE)(req);
        const User = dataSources.userAPI;
        const user = await User.findOnebyId(id);
        return user;
    },
    userProfile: async (_, { id }, { dataSources, req }) => {
        const User = dataSources.userAPI;
        const user = await User.findOnebyId(id);
        return user;
    },
    me: async (_, __, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        return user;
    },

    getUserInfo: async (_, { __ }, { dataSources, req }) => {
        const users = await isauthenticated()(req);
        const id = users.id;
        const User = dataSources.userAPI;
        const user = await User.findOnebyId(id);
        return user;
    },
    findUser: async (_, { value }, { dataSources, req }) => {
        const User = dataSources.userAPI;
        let user = null;
        const regex = value.split(" "); // split into array of words
        // construct regex to match any of the words

        // eslint-disable-next-line no-unused-vars
        if (regex[1] != null) {
            user = await User.findFirstLastName1(regex);
            if (user.length === 0) {
                user = await User.findLastFirstName1(regex);
            }
        } else {
            user = await User.findFirstLastName2(regex);
        }
        if (value === "") {
            user = null;
        }

        return user;
    }
};
module.exports = user_query;
