const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { InMemoryLRUCache } = require("@apollo/utils.keyvaluecache");
const { readFileSync } = require("fs");
const gql = require("graphql-tag");
const mongoose = require("mongoose");
const WebSocket = require("ws"); // import the ws library
require("dotenv").config();

const typeDefs = gql(readFileSync("./user.graphql", { encoding: "utf-8" }));
const resolvers = require("./src/index");
const UserAPI = require("./datasources/UserApi");
const MessageAPI = require("./datasources/messageApi");
const EventAPI = require("./datasources/EventApi");
const AssociationApi = require("./datasources/AssociationApi");
const PostApi = require("./datasources/PostApi");
const { createServer } = require("http");
const { ApolloServerPluginDrainHttpServer } = require("@apollo/server/plugin/drainHttpServer");
const express = require("express");
const app = express();
const { useServer } = require("graphql-ws/lib/use/ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { PubSub } = require("graphql-subscriptions");
async function startApolloServer () {
    const httpServer = createServer(app);
    // const schema = new ApolloServer({ typeDefs, resolvers }).schema;
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const pubsub = new PubSub();
    // start the WebSocket server
    const wsServer = new WebSocket.Server({ port: 4002 });
    const serverCleanup = useServer({ schema }, wsServer);
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        cache: new InMemoryLRUCache(),
        plugins: [
            // Proper shutdown for the HTTP server.
            ApolloServerPluginDrainHttpServer({ httpServer }),

            // Proper shutdown for the WebSocket server.
            {
                async serverWillStart () {
                    return {
                        async drainServer () {
                            await serverCleanup.dispose();
                        }
                    };
                }
            }
        ],
        cors: {
            origin: ["http://localhost:3001/", "http://localhost:3000"],
            Credentials: true
        }
    });
    console.log("WebSocket server started on port 4002");

    wsServer.on("connection", (socket) => {
        console.log("WebSocket client connected");

        socket.on("message", (data) => {
            console.log("Received WebSocket message:", data);
            // handle incoming messages from clients
        });

        socket.on("close", () => {
            console.log("WebSocket client disconnected");
            // handle client disconnection
        });
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
                        postAPI: new PostApi(),
                        messageAPI: new MessageAPI()
                    },
                    req,
                    pubsub,
                    wsServer // add the WebSocket server instance to the Apollo server context
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
