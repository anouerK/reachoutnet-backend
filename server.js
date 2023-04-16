const { ApolloServer } = require("@apollo/server");

const { startStandaloneServer } = require("@apollo/server/standalone");
const { InMemoryLRUCache } = require("@apollo/utils.keyvaluecache");
const { readFileSync } = require("fs");
const gql = require("graphql-tag");
const mongoose = require("mongoose");
require("dotenv").config();
const typeDefs = gql(readFileSync("./user.graphql", { encoding: "utf-8" }));
const resolvers = require("./src/index");
const UserAPI = require("./datasources/UserApi");
const EventAPI = require("./datasources/EventApi");
const AssociationApi = require("./datasources/AssociationApi");
const PostApi = require("./datasources/PostApi");
const myPlugin = {
    // Fires whenever a GraphQL request is received from a client.
    async requestDidStart (requestContext) {
        // console.log("Request started! Query:\n" + requestContext.request.query);

        return {
        // Fires whenever Apollo Server will parse a GraphQL
        // request to create its associated document AST.
            async parsingDidStart (requestContext) {
                // console.log("Parsing started!");
            },

            // Fires whenever Apollo Server will validate a
            // request's document AST against your GraphQL schema.
            async validationDidStart (requestContext) {
                // console.log("Validation started!");
            }
        };
    }
};
async function startApolloServer () {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        cache: new InMemoryLRUCache(),
        plugins: [myPlugin],
        cors: {
            origin: ["http://localhost:3001/", "http://localhost:3000"],
            Credentials: true
        }

    });
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log("MongoDB connected!");
        })
        .catch(err => console.log(err));
    const port = 4001;
    const subgraphName = "user";

    try {
        const { url } = await startStandaloneServer(server, {
            context: async ({ req }) => {
                return {
                    dataSources: {
                        userAPI: new UserAPI(),
                        eventAPI: new EventAPI(),
                        associationAPI: new AssociationApi(),
                        postAPI: new PostApi()
                    },
                    req
                };
            },
            listen: { port }
        });
        console.log(`🚀 🌑 Subgraph ${subgraphName} running at ${url}`);
    } catch (err) {
        console.error(err);
    }
}
startApolloServer();
