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
/*
const https = require("https");

const options = {
    hostname: "www.linkedin.com",
    path: "/oauth/v2/accessToken?code=AQRZQjbbiGs2fIJA8o0UqBR27y3MRmTOqifhKpm0hrkHcrt1WW1moBX53KPK02mOwRKMcd09VxiDtUPNM0-dgiOtCN1ecvw0Df0BgzBiGvAEyIZRFcssjtIGBjR1eOMe4OW5s8_DFGlioy_dFv8f4bf_afiKPdO0LcKaJdA9wHM5IuljKqX_Q3xXgFuIpB_yyRK7_Fr4ITry0OLIIyM&grant_type=authorization_code&client_id=783i64m5ssj1yr&client_secret=SFlxPWAtQfcytNMR&redirect_uri=http://localhost:3001/linkedin",
    method: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    }
};

const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on("data", d => {
        process.stdout.write(d);
    });
});

req.on("error", error => {
    console.error(error);
});

req.end();
*/
async function startApolloServer () {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        cache: new InMemoryLRUCache(),
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
    /* app.use(
        cors < cors.CorsRequest > ({
            origin: "*",
            credentials: true
        }),
        expressMiddleware(server)
    ); */
    // applyMiddleware(server, ...app);
    const port = 4001;
    const subgraphName = "user";

    try {
        const { url } = await startStandaloneServer(server, {
            context: async ({ req }) => {
                return {
                    dataSources: {
                        userAPI: new UserAPI()
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
