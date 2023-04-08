import { expect, test } from "vitest";
import user_query from "../query/user";
import UserAPI from "../../datasources/UserApi";
import user_mutation from "../mutation/user";

test("user query ", () => {
    expect(user_query).toBeDefined();
});
test("user mutation", () => {
    expect(user_mutation).toBeDefined();
});

test("dataSource", () => {
    expect(UserAPI).toBeDefined();
});
