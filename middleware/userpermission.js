/* eslint-disable complexity */
const UserAPI = require("../datasources/UserApi");
const AssociationApi = require("../datasources/AssociationApi");
const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");

const userpermission = {
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
// eslint-disable-next-line no-unused-vars
const association_permission = {
    POST_MANAGEMENT: 1,
    ASSOCIATION_MANAGEMENT: 2,
    MEMBERS_MANAGEMENT: 4,
    REQUESTS_MANAGEMENT: 8,
    EVENT_MANAGEMENT: 16,
    ALL: 31
};

const authorize = (permission) => {
    // eslint-disable-next-line complexity
    return async (req) => {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            throw new GraphQLError("NO TOKEN WAS PROVIDED", {
                extensions: {
                    code: "UNAUTHENTICATED",
                    http: { status: 401 }
                }
            });
        }

        const [bearer, token] = authorizationHeader.split(" ");

        if (bearer !== "Bearer" || !token) {
            throw new GraphQLError("INVALID TOKEN FORMAT", {
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
        if (user.banned) {
            throw new GraphQLError("BANNED", {
                extensions: {
                    code: "FORBIDDEN",
                    http: { status: 403 }
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
// eslint-disable-next-line no-unused-vars
const authorize_association = (permission, associationid) => {
    // eslint-disable-next-line complexity
    return async (req) => {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            throw new GraphQLError("NO TOKEN WAS PROVIDED", {
                extensions: {
                    code: "UNAUTHENTICATED",
                    http: { status: 401 }
                }
            });
        }

        const [bearer, token] = authorizationHeader.split(" ");

        if (bearer !== "Bearer" || !token) {
            throw new GraphQLError("INVALID TOKEN FORMAT", {
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
        if (user.banned) {
            throw new GraphQLError("BANNED", {
                extensions: {
                    code: "FORBIDDEN",
                    http: { status: 403 }
                }
            });
        }
        const associationapi = new AssociationApi();
        // const association_user = await associationapi.findOne({ "members.user": decoded.userId });
        const searched_association = await associationapi.findOnebyId(associationid);
        if (searched_association) {
            // eslint-disable-next-line eqeqeq
            if (!(searched_association.owner._id == decoded.userId)) {
                const association_user = await associationapi.getUserPermission(decoded.userId, associationid);
                if (association_user) {
                    const member = association_user.members.find(member => member.user.equals(decoded.userId));
                    const hasPermission = (member.permissions & permission) !== 0;
                    if (!hasPermission) {
                        throw new GraphQLError("FORBIDDEN", {
                            extensions: {
                                code: "FORBIDDEN",
                                http: { status: 403 }
                            }
                        });
                    }
                } else {
                    throw new GraphQLError("NOT FOUND", {
                        extensions: {
                            code: "NOT FOUND",
                            http: { status: 404 }
                        }
                    });
                }
            }
        } else {
            console.log("???");
            throw new GraphQLError("NOT FOUND", {
                extensions: {
                    code: "NOT FOUND",
                    http: { status: 404 }
                }
            });
        }

        /*
        const hasPermission = (user.permissions & permission) !== 0;

        if (!hasPermission) {
            throw new GraphQLError("User doesn't have the permission", {
                extensions: {
                    code: "FORBIDDEN",
                    http: { status: 403 }
                }
            });
        } */
    };
};

const isauthenticated = () => {
    // eslint-disable-next-line complexity
    return async (req) => {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            throw new GraphQLError("NO TOKEN WAS PROVIDED", {
                extensions: {
                    code: "UNAUTHENTICATED",
                    http: { status: 401 }
                }
            });
        }

        const [bearer, token] = authorizationHeader.split(" ");

        if (bearer !== "Bearer" || !token) {
            throw new GraphQLError("INVALID TOKEN FORMAT", {
                extensions: {
                    code: "UNAUTHENTICATED",
                    http: { status: 401 }
                }
            });
        }

        const userapi = new UserAPI();
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await userapi.findOne({ _id: decoded.userId });
            if (!user) {
                throw new GraphQLError("User is not authenticated", {
                    extensions: {
                        code: "UNAUTHENTICATED",
                        http: { status: 401 }
                    }
                });
            } else {
                return user;
            }
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                throw new GraphQLError("Token has expired", {
                    extensions: {
                        code: "UNAUTHENTICATED",
                        http: { status: 401 }
                    }
                });
            } else {
                throw new GraphQLError("Invalid token", {
                    extensions: {
                        code: "UNAUTHENTICATED",
                        http: { status: 401 }
                    }
                });
            }
        }
    };
};

Object.freeze(userpermission);
Object.freeze(association_permission);

module.exports.userpermission = userpermission;
module.exports.authorize = authorize;
module.exports.authorize_association = authorize_association;
module.exports.isauthenticated = isauthenticated;
module.exports.association_permission = association_permission;
