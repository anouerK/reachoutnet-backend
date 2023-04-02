/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
const { GraphQLError } = require("graphql");
const { isauthenticated } = require("../../middleware/userpermission");
const { isValidObjectId } = require("mongoose");
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
    },
    addMember: async (_, { id, skillsToAdd }, { dataSources, req }) => { // allow users to add a skill
        if (!isValidObjectId(id)) throw new GraphQLError("Invalid user id");

        /* const { error, value } = schema.validate(skillsToAdd);
        if (error) { return new GraphQLError(error.message); }; */
        const association = await dataSources.AssociationApi.findOneAssociationandPopulateMembers(id);

        if (!association) throw new GraphQLError("User not found");
        return association;
        /*
        value.forEach((skillToAdd) => {
            const existingSkill = user.skills.find((s) => {
                return s.skill._id.toString() === skillToAdd.skill.toString();
            });

            if (existingSkill) {
                throw new GraphQLError(`${existingSkill.skill.name} already exists`);
            }
            user.skills.push({
                skill: skillToAdd.skill,
                level: skillToAdd.level,
                verified: skillToAdd.verified,
                last_modified: Date.now()
            });
        }
        ); */
        /*
        const updated_user = await user.save();
        if (!updated_user) throw new GraphQLError("Failed to add skill");
        const returned_user = await dataSources.userAPI.findOneUserandPopulateSkills(id);
        if (!returned_user) throw new GraphQLError("Failed to get user skill");
        return returned_user; */
    }
    /*
    addMember: async (_, { ida, idm }, { dataSources, req }) => {
        const Association = dataSources.associationAPI;

        const user = await Association.updateAssociation(id, updateData, { new: true });
        return user;
    },
    updateMember: async (_, args, { dataSources, req }) => {
        const Association = dataSources.associationAPI;
        const { id, ...updateData } = args;
        const user = await Association.updateAssociation(id, updateData, { new: true });
        return user;
    } */

};

module.exports = association_mutation;
