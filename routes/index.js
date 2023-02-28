/* eslint-disable complexity */
var express = require("express");
// const attachUserToReq = require("../middleware/attachUserToReq");
var router = express.Router();
const {attachUserToReq}= require("../middleware/auth");
const { loadFilesSync } = require("@graphql-tools/load-files");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const { loadSchemaSync } = require("@graphql-tools/load");
const { makeExecutableSchema } = require("graphql-tools");

const {merge} = require("lodash");

const { graphqlHTTP } = require("express-graphql");


router.use(attachUserToReq);
const user_router = require("./gestion_user/users");
const posts_router = require("./Gestion_Posts_Routes/PostRoute");
const comments_router = require("./Gestion_Posts_Routes/CommentRoute");
const likes_router = require("./Gestion_Posts_Routes/LikeRoute");





// router.use(attachUserToReq);

const typeDefs = loadSchemaSync("./schemas/*.graphql", {
  loaders: [new GraphQLFileLoader()],
});

const resolverFiles = loadFilesSync("./resolvers/*.resolver.*");

const resolvers = merge(resolverFiles);



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
router.use("/post", posts_router);
router.use("/comment", comments_router);
router.use("/like", likes_router);



module.exports = router;
