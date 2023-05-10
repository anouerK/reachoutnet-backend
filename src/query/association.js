/* eslint-disable no-unused-vars */
const { isauthenticated, userpermission, authorize } = require("../../middleware/userpermission");
const statsCategoryAssociation = require("../graphlookup/statsCategoryAssociation");
const { recomendedAssociations } = require("../graphlookup/associationGraphLookup");

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
        return resultat[1];
    },
    recommandedAssociation: async (_, __, { dataSources, req }) => {
        const users = await isauthenticated()(req);
        const id = users.id;
        const recommanded = await recomendedAssociations(id);
        let recommand = [];
        if (recommanded[0]) {
            recommand = recommanded[0].associations.map(r => ({
                id: r._id,
                owner: r.owner,
                category: r.category,
                img: r.img,
                name: r.img,
                description: r.description,
                email: r.email,
                updated_at: r.updated_at,
                verified: r.verified,
                status: r.status,
                members: r.members,
                address: r.address,
                phone: r.phone,
                Creation_date: r.Creation_date
            }));
            return recommand;
        }
    }
};

module.exports = association_query;
