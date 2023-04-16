
// eslint-disable-next-line no-unused-vars
const AuthLog = require("../../datasources/authlog");
// eslint-disable-next-line no-unused-vars
const User = require("../../datasources/user");

async function maxCount () {
    const result = await AuthLog.aggregate([
        {
            $match: {
                timestamp: {
                    $exists: true,
                    $type: "date",
                    $gte: new Date(new Date().getFullYear(), 0, 1),
                    $lt: new Date(new Date().getFullYear() + 1, 0, 1)
                }
            }
        },
        {
            $group: {
                _id: {
                    user: "$user",
                    month: { $dateToString: { format: "%Y-%m", date: "$timestamp" } }
                },
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id.user",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $project: {
                _id: 0,
                name: { $concat: ["$user.first_name", " ", "$user.last_name"] },
                month: { $substr: ["$_id.month", 6, -1] },
                year: { $substr: ["$_id.month", 0, 4] },
                count: 1
            }
        },
        {
            $sort: {
                "_id.month": 1,
                count: -1
            }
        },
        {
            $group: {
                _id: "$month",
                year: { $first: "$year" },
                users: {
                    $push: {
                        name: "$name",
                        count: "$count"
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                month: "$_id",
                year: 1,
                users: { $slice: ["$users", 3] }
            }
        },
        {
            $sort: {
                year: -1,
                month: 1
            }
        },
        {
            $addFields: {
                max_count: { $max: "$users.count" }
            }
        },
        {
            $group: {
                _id: null,
                max_count: { $max: "$max_count" }
            }
        },
        {
            $project: {
                _id: 0,
                max_count: 1
            }
        }
    ]);

    return result;
}

module.exports = maxCount;
