/* eslint-disable complexity */
const UserAPI = require("../datasources/UserApi");
const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");

const userpermission = {
    NONE: 0,
    VIEW_DASHBOARD: 1,
    VIEW_USER_MODULE: 2,
    USER_MODULE_CRUDS: 4,
    VIEW_POST_MODULE: 8,
    POST_MODULE_CRUDS: 16,
    VIEW_ASSOCIATIONS_MODULE: 32,
    ASSOSATIONS_MODULE_CRUDS: 64,
    VIEW_COMMUNICATION_MODULE: 128,
    COMMUNICATION_MODULE_CRUDS: 256,
    ALL: 511 // All permissions*/

};

const authorize = (permission) => {
    // eslint-disable-next-line complexity
    return async (req) => {
        const token = req.headers.authorization;

        if (!token) {
            throw new GraphQLError("NO TOKEN WAS PROVIDED", {
                extensions: {
                    code: "UNAUTHENTICATED",
                    http: { status: 401 }
                }
            });
        }

        const userapi = new UserAPI();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userapi.findOne({ _id: decoded.userId });

        if (!user) {
            throw new GraphQLError("User is not authenticated", {
                extensions: {
                    code: "UNAUTHENTICATED",
                    http: { status: 401 }
                }
            });
        }
        const hasPermission = (user.permissions & permission) !== 0;

        if (!hasPermission) {
            throw new GraphQLError("User doesn't have the permission", {
                extensions: {
                    code: "FORBIDDEN",
                    http: { status: 403 }
                }
            });
        }
    };
};
/*
const authorize = (permission) => {
  // eslint-disable-next-line complexity
  return async (req) => {
    // Check if the user has the required permission
    console.log("\n 1: "+permission);
    if (!req.user || ((!req.user.permissions & permission)!== permission) ) {
      throw new Error("Forbidden");
    }
  };
};
*/
Object.freeze(userpermission);

module.exports.userpermission = userpermission;
module.exports.authorize = authorize;
