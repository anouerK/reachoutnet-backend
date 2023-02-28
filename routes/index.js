/* eslint-disable complexity */
var express = require("express");
// const attachUserToReq = require("../middleware/attachUserToReq");
var router = express.Router();
const {attachUserToReq}= require("../middleware/auth");
//const { loadFilesSync } = require("@graphql-tools/load-files");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const { loadSchemaSync } = require("@graphql-tools/load");
const { makeExecutableSchema } = require("graphql-tools");

const {merge} = require("lodash");

const { graphqlHTTP } = require("express-graphql");


router.use(attachUserToReq);
const user_router = require("./gestion_user/users");

const  resolvers_chat = require("../resolvers/Chatresolver");
const   userresolvers  = require("../resolvers/UserResolver");


// router.use(attachUserToReq);

const typeDefs = loadSchemaSync("./**/*.graphql", {
  loaders: [new GraphQLFileLoader()],
});

//const resolverFiles = loadFilesSync("./**/*.resolver.*");

const resolvers = merge(resolvers_chat,userresolvers);



const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

router.use("/graphql", graphqlHTTP((req) => ({
  schema,
  context: { req },
  graphiql: true
})));



router.use("/users", user_router);



module.exports = router;
