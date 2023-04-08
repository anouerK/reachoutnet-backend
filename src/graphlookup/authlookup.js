const AuthLog = require("../../datasources/authlog");
async function activeusers () {
    const result = await AuthLog.aggregate([
        {
            $match: {
                timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // filter logs for the last month
            }
        },
        {
            $group: {
                _id: "$user",
                count: { $sum: 1 }
            }
        },
        {
            $match: {
                count: { $gte: 1 } // filter users who logged in at least once
            }
        }
    ]);
    // console.log(result);
    return result;
}

module.exports = activeusers;
