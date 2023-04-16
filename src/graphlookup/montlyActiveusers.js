
// eslint-disable-next-line no-unused-vars
const AuthLog = require("../../datasources/authlog");
// eslint-disable-next-line no-unused-vars
const User = require("../../datasources/user");
async function montlyActiveUsers () {
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
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $group: {
                _id: {
                    name: { $concat: ["$user.first_name", " ", "$user.last_name"] },
                    month: { $dateToString: { format: "%Y-%m", date: "$timestamp" } }
                },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                name: "$_id.name",
                month: { $substr: ["$_id.month", 6, -1] },
                year: { $substr: ["$_id.month", 0, 4] },
                count: 1
            }
        },
        {
            $sort: {
                month: 1,
                count: -1
            }
        },
        {
            $group: {
                _id: "$name",
                months: {
                    $push: {
                        month: "$month",
                        count: "$count"
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                name: "$_id",
                months: 1
            }
        }
    ]);
    return result;
}

module.exports = montlyActiveUsers;
