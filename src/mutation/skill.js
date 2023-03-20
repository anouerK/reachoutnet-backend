const { GraphQLError } = require("graphql");
const { authorize, userpermission } = require("../../middleware/userpermission");
const { isValidObjectId } = require("mongoose");
const Joi = require("joi");

const schema = Joi.array().items(Joi.object({
    skill: Joi.string().required().custom((value, helper) => {
        if (!isValidObjectId(value)) {
            return helper.message("Invalid skill ObjectId");
        }
        return value;
    }),
    level: Joi.number().required().min(1).max(5),
    verified: Joi.boolean().required()
}));

const skill_mutation = {
    addSkill: async (_, { name, description }, { dataSources, req }) => { // allow admins to add skill
        const skill = {
            name,
            description
        };
        const savedSkill = await dataSources.userAPI.addSkill(skill);
        return savedSkill;
    },
    updateSkill: async (_, args, { dataSources, req }) => { // allow admins to update skill
        const Skill = dataSources.userAPI;
        const { id, ...updateData } = args;
        const skill = await Skill.updateSkill(id, updateData, { new: true });
        return skill;
    },
    deleteSkill: async (_, { id }, { dataSources, req }) => { // allow admins to update skill and delete the skills in users
        try {
            const User = dataSources.userAPI;
            const Skill = dataSources.userAPI;
            const skill = await Skill.deleteSkill(id);
            const users = await User.getAllUsers();
            if (!skill) {
                throw new GraphQLError("Skill not found");
            }

            users.forEach(async (user) => {
                user.skills = await user.skills.filter(skill => skill.skill.toString() !== id);
                await user.save();
            });

            return skill;
        } catch (error) {
            console.error(error);
            throw new GraphQLError("Failed to delete Skill");
        }
    },

    addUserSkill: async (_, { id, skillsToAdd }, { dataSources, req }) => { // allow users to add a skill
        await authorize(userpermission.POST_MODULE_CRUDS)(req);
        if (!isValidObjectId(id)) throw new GraphQLError("Invalid user id");

        const { error, value } = schema.validate(skillsToAdd);
        if (error) { return new GraphQLError(error.message); };
        const user = await dataSources.userAPI.findOneUserandPopulateSkills(id);

        if (!user) throw new GraphQLError("User not found");

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
        );
        const updated_user = await user.save();
        if (!updated_user) throw new GraphQLError("Failed to add skill");
        const returned_user = await dataSources.userAPI.findOneUserandPopulateSkills(id);
        if (!returned_user) throw new GraphQLError("Failed to get user skill");
        return returned_user;
    },
    deleteUserSkill: async (_, { id, skillId }, { dataSources, req }) => { // allow users to delete a skill
        try {
            const User = dataSources.userAPI;
            const user = await User.findOnebyId(id);
            if (!user) throw new Error("User not found");
            // Filter out the skill with the given skillId
            user.skills = user.skills.filter(skill => skill.skill.toString() !== skillId);
            await user.save();
            return user;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};
module.exports = skill_mutation;

// const User = dataSources.userAPI;
// try {
//     const user = await User.findOnebyId(id).populate("skills.skill");
//     if (!user) {
//         throw new Error("User not found");
//     }
//     skillsToAdd.forEach((skillToAdd) => {
//         if (skillToAdd.skill != null) {
//             // eslint-disable-next-line no-unused-vars
//             const existingSkill = user.skills.find(
//                 (skill) => skill.skill._id.toString() === skillToAdd.skill);

//             /* if (existingSkill) {
//            existingSkill.level = skillToAdd.level;
//             existingSkill.verified = skillToAdd.verified;
//             existingSkill.last_modified = new Date(); */
//             if (!existingSkill) {
//                 user.skills.push({
//                     skill: skillToAdd.skill
//                 });
//             }
//         }
//     });
//     await user.save();
//     return user;
// } catch (error) {
//     console.error(error);
//     throw error;
// }
