const { GraphQLError } = require("graphql");
const { authorize, userpermission } = require("../../middleware/userpermission");
const { isValidObjectId } = require("mongoose");
const Joi = require("joi");
const { isauthenticated } = require("../../middleware/userpermission");
const schema = Joi.array().items(Joi.object({
    interest: Joi.string().required().custom((value, helper) => {
        if (!isValidObjectId(value)) {
            return helper.message("Invalid interest ObjectId");
        }
        return value;
    }),
    level: Joi.number().required().min(1).max(5),
    verified: Joi.boolean().required()
}));
const interest_mutation = {
    addInterest: async (_, { nameInterest }, { dataSources, req }) => {
        try {
            const user = await isauthenticated()(req);
            const newInterests = [];
            nameInterest.forEach(interest => {
                const interestIndex = user.interests.indexOf(interest);
                if (interestIndex === -1) {
                    user.interests.push(interest);
                    newInterests.push(interest);
                }
            });
            if (newInterests.length > 0) {
                return await user.save();
            } else {
                throw new Error("interests not added");
            }
        } catch (error) {
            return error;
        }
    },
    deleteInterest: async (_, { id }, { dataSources, req }) => {
        try {
            // await authorize(userpermission.POST_MODULE_CRUDS)(req);
            const Interest = dataSources.userAPI;

            const interest = await Interest.deleteInterest(id);
            if (!interest) {
                throw new GraphQLError("Interest not found");
            }
            console.log(interest);
            return interest;
        } catch (error) {
            console.error(error);
            throw new GraphQLError("Failed to delete Interest");
        }
    },
    updateInterest: async (_, args, { dataSources, req }) => {
        const User = dataSources.userAPI;
        const { id, ...updateData } = args;
        const existingInterest = await User.getInterest(id);
        if (!existingInterest) {
            throw new GraphQLError("Interest not found");
        }
        const interest = await User.updateInterest(id, updateData);

        return interest;
    },
    addUserInterest: async (_, { id, interestsToAdd }, { dataSources, req }) => {
        await authorize(userpermission.POST_MODULE_CRUDS)(req);
        if (!isValidObjectId(id)) throw new GraphQLError("Invalid user id");

        const { error, value } = schema.validate(interestsToAdd);
        if (error) { return new GraphQLError(error.message); };
        const user = await dataSources.userAPI.findOneUserandPopulateInterests(id);

        if (!user) throw new GraphQLError("User not found");

        value.forEach((interestsToAdd) => {
            const existingInterest = user.interest.find((i) => {
                return i.interest._id.toString() === interestsToAdd.interest.toString();
            });

            if (existingInterest) {
                throw new GraphQLError(`${existingInterest.interest.name} already exists`);
            }
            user.interests.push({
                interest: interestsToAdd.interest,
                level: interestsToAdd.level,
                verified: interestsToAdd.verified,
                last_modified: Date.now()
            });
        }
        );
        const updated_user = await user.save();
        if (!updated_user) throw new GraphQLError("Failed to add interest");
        const returned_user = await dataSources.userAPI.findOneUserandPopulateInterests(id);
        if (!returned_user) throw new GraphQLError("Failed to get user interest");
        return returned_user;
    },
    deleteUserInterest: async (_, { id, interestId }, { dataSources, req }) => {
        try {
            const User = dataSources.userAPI;
            const user = await User.findOnebyId(id);
            if (!user) throw new Error("User not found");
            // Filter out the interest with the given interestId
            user.interests = user.interests.filter(interest => interest.interest.toString() !== interestId);
            await user.save();
            return user;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};

module.exports = interest_mutation;
