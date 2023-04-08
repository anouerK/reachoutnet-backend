const User = require("../../datasources/user");
async function calculateScores (userId) {
    const user = await User.findById(userId);
    const weights = {
        country: 0.6,
        // country_mismatch: 0.2,
        skills: 0.4,
        // skills_mismatch: 0.1,
        interests: 0.2
        // interests_mismatch: 0.1
    };

    const result = await User.aggregate([
        {
            $match: {
                _id: { $ne: user._id }
            }
        },
        {
            $project: {
                email: 1,
                first_name: 1,
                last_name: 1,
                username: 1,
                country: 1,
                countryScore: {
                    $cond: [
                        { $eq: ["$country", user.country] },
                        weights.country,
                        0
                    ]
                },
                skillsScore: {
                    $reduce: {
                        input: "$skills",
                        initialValue: 0,
                        in: {
                            $add: [
                                "$$value",
                                {
                                    $multiply: [
                                        {
                                            $cond: [
                                                {
                                                    $in: [
                                                        "$$this.skill",
                                                        user.skills.map((skill) => skill.skill)
                                                    ]
                                                },
                                                weights.skills,
                                                0
                                            ]
                                        },
                                        1
                                    ]
                                }
                            ]
                        }
                    }
                },
                interestsScore: {
                    $reduce: {
                        input: "$interests",
                        initialValue: 0,
                        in: {
                            $add: [
                                "$$value",
                                {
                                    $multiply: [
                                        {
                                            $cond: [
                                                {
                                                    $in: [
                                                        "$$this.type",
                                                        user.interests.map((interest) => interest.type)
                                                    ]
                                                },
                                                weights.interests,
                                                0
                                            ]
                                        },
                                        1
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $project: {
                username: 1,
                email: 1,
                first_name: 1,
                last_name: 1,
                country: 1,
                countryScore: 1,
                skillsScore: 1,
                interestsScore: 1,
                score: {
                    $add: ["$countryScore", "$skillsScore", "$interestsScore"]
                }
            }
        },
        {
            $sort: {
                score: -1
            }
        },
        { $limit: 10 }
    ]);

    const userList = result.map(user => ({
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        country: user.country,
        email: user.email,
        username: user.username,

        score: user.score
    }));
    console.log(userList);
    return userList;
}

module.exports = calculateScores;
