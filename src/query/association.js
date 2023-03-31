/* eslint-disable no-unused-vars */
const { isauthenticated, userpermission, authorize } = require("../../middleware/userpermission");
const association_query = {
    associations: async (_, __, { dataSources, req }) => {
        const associations = await dataSources.associationAPI.getAllAssociations();
        return associations;
    },
    association: async (_, { id }, { dataSources, req }) => {
        const Association = dataSources.associationAPI;
        const association = await Association.findOnebyId(id);
        return association;
    },
    associationByName: async (_, { name }, { dataSources, req }) => {
        const Association = dataSources.associationAPI;
        const association = await Association.findByName(name);
        return association;
    }
};

module.exports = association_query;
