/* eslint-disable complexity */
/* eslint-disable no-unused-vars */
const { ApolloServer, gql } = require("apollo-server");
const bcrypt = require("bcryptjs");
const User = require("./user");
const jwt = require("jsonwebtoken");
const { userpermission, authorize } = require("./userpermission");
const [auth, auth_permission_checker] = require("./auth");
const { loadSchemaSync } = require("@graphql-tools/load");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
//var r = require("../../models/schemas/userschema.graphql");
const typeDefs = loadSchemaSync("./**/*.graphql", {
  loaders: [new GraphQLFileLoader()],
});

const resolvers = {
  Query: {
    users: async (_, __, { req }) => {
      await authorize(userpermission.VIEW_USER_MODULE)(req);
      const users = await User.find();
      return users;
    },
    user: async (_, { id }, { req }) => {
      await authorize(userpermission.VIEW_USER_MODULE)(req);
      const user = await User.findById(id);
      return user;
    },
  },
  Mutation: {addUser: async (_, { username, first_name, last_name, age, email, password, permissions }, { req }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      first_name,
      last_name,
      age,
      email,
      password: hashedPassword,
      permissions,
    });
    await authorize(userpermission.POST_MODULE_CRUDS)(req);
    await user.save();
    return user;
  },

  updateUser: async (_, args, { req }) => {
    await authorize(userpermission.POST_MODULE_CRUDS)(req);
    const { id, ...updateData } = args;
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    return user;
  },

  deleteUser: async (_, { id }, { req }) => {
    try {
      await authorize(userpermission.POST_MODULE_CRUDS)(req);
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to delete user");
    }
  },
  async login(parent, { email, password }) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("Invalid login credentials");
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid login credentials");
      }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      return { user, token };
    } catch (error) {
      console.error(error);
      throw new Error("Authentication failed");
    }
  },
    // Add any other mutation resolvers here
  },
};
module.exports = { typeDefs, resolvers };
