const { isauthenticated, userpermission, authorize } = require("../../middleware/userpermission");
const user_query = {
    users: async (_, __, { dataSources, req }) => {
        await authorize(userpermission.VIEW_USER_MODULE)(req);
        const users = await dataSources.userAPI.getAllUsers();
        return users;
    },

    user: async (_, { id }, { dataSources, req }) => {
        await authorize(userpermission.VIEW_USER_MODULE)(req);
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
    }
};
module.exports = user_query;
