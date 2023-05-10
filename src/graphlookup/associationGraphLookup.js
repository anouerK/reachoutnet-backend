// eslint-disable-next-line no-unused-vars
const Follow = require("../../datasources/follow");
// eslint-disable-next-line no-unused-vars
const Association = require("../../datasources/association");
// eslint-disable-next-line no-unused-vars
const mongoose = require("mongoose");
// eslint-disable-next-line no-unused-vars

async function recomendedAssociations (userId) {
    return new Promise((resolve, reject) => {
        Follow.find({
            followerId: userId,
            followerType: "users",
            followingType: "associations"
        })
            .distinct("followingId")
            .exec(async (err, followedAssociations) => {
                if (err) {
                    console.error("Error finding followed associations:", err);
                    reject(err);
                    return;
                }
                try {
                    // Step 2: Find associations that the user is not following and have the same category
                    const recommendedAssociations = await Association.aggregate([
                        // Match associations that the user is not following
                        {
                            $match: {
                                _id: { $in: followedAssociations }
                            }
                        },
                        // Lookup associations that have the same category as followed associations
                        {
                            $lookup: {
                                from: "associations",
                                let: { category: "$category" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ["$$category", "$category"] }
                                        }
                                    }
                                ],
                                as: "associatedAssociations"
                            }
                        },
                        // Unwind the associatedAssociations array
                        {
                            $unwind: "$associatedAssociations"
                        },
                        // Filter out associations that are already followed
                        {
                            $match: {
                                "associatedAssociations._id": { $nin: followedAssociations }
                            }
                        },
                        // Group the associations by category and _id
                        {
                            $group: {
                                _id: {
                                    category: "$category",
                                    associationId: "$associatedAssociations._id"
                                },
                                association: { $first: "$associatedAssociations" }
                            }
                        },
                        // Group the associations by category
                        {
                            $group: {
                                _id: 0,
                                associations: { $push: "$association" }
                            }
                        },
                        // Project the associations
                        {
                            $project: {
                                associations: 1
                            }
                        },
                        { $limit: 5 }
                    ]).exec();

                    resolve(recommendedAssociations);
                    // Do something with the recommended associations
                } catch (error) {
                    console.error("Error finding recommended associations:", error);
                }
            });
    });
}

module.exports = { recomendedAssociations };
