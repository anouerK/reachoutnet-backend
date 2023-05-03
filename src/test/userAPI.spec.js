import { beforeAll, expect, test } from "vitest";

import server from "../../server";
const request = require("supertest");
let token = "";
let user_id = "";
beforeAll(() => {
    // eslint-disable-next-line no-unused-expressions
    server;
});

test("login", async () => {
    const response = await request("http://localhost:4001").post("/").set("Accept", "application/json").send({
        query: `
          mutation {
            login(email: "test@test.com", password: "123456789") {
              token
            }
          }
        `
    });
    token = response.body.data.login.token;
    // user_id=response.body.data.login.user_id;
    expect(response.body.data.login.token).toBeDefined();
});

test("getUserInfo", async () => {
    const response = await request("http://localhost:4001").post("/").set("Accept", "application/json").set("Authorization", `Bearer ${token}`).send({
        query: `
            query {
                getUserInfo {
                    id
                    username
                    email
                }
            }
        `
    });
    user_id = response.body.data.getUserInfo.id;

    expect(response.body.data.getUserInfo.username).toBeDefined();
});

test("userProfile", async () => {
    const response = await request("http://localhost:4001").post("/").set("Accept", "application/json").set("Authorization", `Bearer ${token}`).send({
        query: `
            query {
                userProfile(id: "${user_id}") {
                    id
                    username
                    email
                }
            }
        `
    });
    expect(response.body.data.userProfile.username).toBeDefined();
});

test("me", async () => {
    const response = await request("http://localhost:4001").post("/").set("Accept", "application/json").set("Authorization", `Bearer ${token}`).send({
        query: `
            query {
                me {
                    id
                    username
                    email
                }
            }
        `
    });
    expect(response.body.data.me.username).toBeDefined();
}

);

test("user", async () => {
    const response = await request("http://localhost:4001").post("/").set("Accept", "application/json").set("Authorization", `Bearer ${token}`).send({
        query: `
            query {
                user(id: "${user_id}") {
                    id
                    username
                    email
                }
            }
        `
    });
    expect(response.body.data.user.username).toBeDefined();
}

);

test("users", async () => {
    const response = await request("http://localhost:4001").post("/").set("Accept", "application/json").set("Authorization", `Bearer ${token}`).send({
        query: `
            query {
                users {
                    id
                    username
                    email
                }
            }
        `
    });
    expect(response.body.data.users.length).toBeGreaterThan(0);
}

);

// test("findUser", async () => {
//     const response = await request("http://localhost:4001").post("/").set("Accept", "application/json").set("Authorization", `Bearer ${token}`).send({
//         query: `
//             query {
//                 findUser(value: "test") {
//                     username
//                     email
//                 }
//             }
//         `
//     });
//     expect(response.body.data.findUser.length).toBeGreaterThan(0);
// }

// );

// test("findUser", async () => {
//     const response = await request("http://localhost:4001").post("/").set("Accept", "application/json").set("Authorization", `Bearer ${token}`).send({
//         query: `
//             query {
//                 findUser(value: "test") {
//                     username
//                     email
//                 }
//             }
//         `
//     });
//     expect(response.body.data.findUser.length).toBeGreaterThan(0);
// }

// );
