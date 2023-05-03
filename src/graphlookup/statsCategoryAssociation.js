// const AuthLog = require("../../datasources/authlog");
const Association = require("../../datasources/association");

async function statsCategoryAssociation () {
    const stats = await Association.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
    return stats;
}
module.exports = statsCategoryAssociation;
