const { GraphQLError } = require("graphql");
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
        const User = dataSources.userAPI;
        try {
            const user = await User.findOnebyId(id).populate("skills.skill");
            if (!user) {
                throw new Error("User not found");
            }
            skillsToAdd.forEach((skillToAdd) => {
                if (skillToAdd.skill != null) {
                    // eslint-disable-next-line no-unused-vars
                    const existingSkill = user.skills.find(
                        (skill) => skill.skill._id.toString() === skillToAdd.skill);

                    /* if (existingSkill) {
                   existingSkill.level = skillToAdd.level;
                    existingSkill.verified = skillToAdd.verified;
                    existingSkill.last_modified = new Date(); */
                    if (!existingSkill) {
                        user.skills.push({
                            skill: skillToAdd.skill
                        });
                    }
                }
            });
            await user.save();
            return user;
        } catch (error) {
            console.error(error);
            throw error;
        }
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
