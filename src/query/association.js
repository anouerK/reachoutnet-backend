/* eslint-disable no-unused-vars */
const { isauthenticated, userpermission, authorize } = require("../../middleware/userpermission");
const statsCategoryAssociation = require("../graphlookup/statsCategoryAssociation");

const association_query = {
    associations: async (_, __, { dataSources, req }) => {
        const associations = await dataSources.associationAPI.getAllAssociations();
        return associations;
    },
    associations_byowner: async (_, __, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        const associations = await dataSources.associationAPI.findByOwner(user._id);
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
    },
    statsCategoryassociation: async (_, __, { dataSources, req }) => {
        const resultat = await statsCategoryAssociation();
        return resultat;
    }
};

module.exports = association_query;
