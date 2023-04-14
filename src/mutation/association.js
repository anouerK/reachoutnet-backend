/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
const { GraphQLError } = require("graphql");
const { isauthenticated } = require("../../middleware/userpermission");
const { isValidObjectId } = require("mongoose");
const Joi = require("joi");
const schema = Joi.array().items(Joi.object({
    id: Joi.string().required().custom((value, helper) => {
        if (!isValidObjectId(value)) {
            return helper.message("Invalid skill ObjectId");
        }
        return value;
    })
}));
const association_mutation = {
    createAssociation: async (_, { name, description, email, members, address, phone }, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        const Association = dataSources.associationAPI;
        const association = {
            name,
            description,
            email,
            members,
            address,
            phone,
            owner: user._id
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
    },
    verifyAssociation: async (_, { id }, { dataSources, req }) => {
        const Association = dataSources.associationAPI;

        const association = await Association.findOnebyId(id);
        if (!association) {
            throw new GraphQLError("Associationr not found");
        }
        association.verified = 1;
        const updated_association = await association.save();
        return updated_association;
    },
    addMember: async (_, { id, users }, { dataSources, req }) => { // allow users to add a skill
        if (!isValidObjectId(id)) throw new GraphQLError("Invalid association id");
        const Association = dataSources.associationAPI;
        const User = dataSources.userAPI;
        const association = await Association.findOnebyId(id);
        if (!association) throw new GraphQLError("Association not found");
        for (let i = 0; i < users.length; i++) {
            const userId = users[i].id;
            const userf = await User.findOnebyId(userId);
            if (!userf) throw new GraphQLError("User not found");
            // Check if the user is already in the association
            const existingMemberIndex = association.members.findIndex(
                (member) => member.user.toString() === userf.id
            );

            if (existingMemberIndex === -1) {
                // Add the user to the association
                association.members.push({ user: userId });
            } else {
                throw new GraphQLError("User already exist");
            }
        }

        // Save the updated association to the database
        const updated_association = await association.save();
        return updated_association;
    },
    removeMember: async (_, { associationId, memberId }, { dataSources }) => {
        if (!isValidObjectId(associationId)) throw new GraphQLError("Invalid association id");

        const Association = dataSources.associationAPI;
        const association = await Association.findOnebyId(associationId);

        if (!association) throw new GraphQLError("Association not found");

        const memberIndex = association.members.findIndex((member) => member.user.toString() === memberId);
        if (memberIndex === -1) throw new GraphQLError("Member not found in association");

        association.members.splice(memberIndex, 1);

        await association.save();

        return "Member removed successfully";
    },
    updateMemberPermissions: async (_, { id, memberId, permissions }, { dataSources }) => {
        if (!isValidObjectId(id)) throw new GraphQLError("Invalid association id");

        const Association = dataSources.associationAPI;
        const association = await Association.findOnebyId(id);

        if (!association) throw new GraphQLError("Association not found");

        const memberIndex = association.members.findIndex((member) => member.user.toString() === memberId);

        if (memberIndex === -1) throw new GraphQLError("Member not found in association");

        association.members[memberIndex].permissions = permissions;

        const updated_association = await association.save();
        if (updated_association) { return "Member permissions updated successfully"; } else {
            return "updating failed";
        }
    }

};

module.exports = association_mutation;
