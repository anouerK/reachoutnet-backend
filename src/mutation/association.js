/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
const { GraphQLError } = require("graphql");
const { isauthenticated } = require("../../middleware/userpermission");

const association_mutation = {
    addAssociation: async (_, { name, description, email, members, address, phone }, { dataSources, req }) => {
        const Association = dataSources.associationAPI;
        const association = {
            name,
            description,
            email,
            members,
            address,
            phone
        };
        const savedassociation = await Association.createAssociation(association);
        return savedassociation;
    },
    updateAssociation: async (_, args, { dataSources, req }) => {
        const Association = dataSources.associationAPI;
        const { id, ...updateData } = args;
        const user = await Association.updateAssociation(id, updateData, { new: true });
        return user;
    },
    deleteAssociation: async (_, { id }, { dataSources, req }) => {
        try {
            const Association = dataSources.associationAPI;

            const association = await Association.deleteAssociation(id);
            if (!association) {
                throw new GraphQLError("Associationr not found");
            }
            return association;
        } catch (error) {
            console.error(error);
            throw new GraphQLError("Association to delete user");
        }
    }
};

module.exports = association_mutation;
