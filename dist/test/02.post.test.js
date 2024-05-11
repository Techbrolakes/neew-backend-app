"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const debug_1 = __importDefault(require("debug"));
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const testData_1 = __importDefault(require("./testData"));
const debug = (0, debug_1.default)("neew:02.post.test");
chai_1.default.should();
async function createOlaPost(data) {
    const res = await (0, supertest_1.default)(app_1.default).post("/api/post/create").set("x-auth-token", testData_1.default.userOla.token).send(data);
    if (res.error)
        console.error(res.error);
    res.status.should.equal(201);
    return res.body;
}
async function createDavidPost(data) {
    const res = await (0, supertest_1.default)(app_1.default).post("/api/post/create").set("x-auth-token", testData_1.default.userDavid.token).send(data);
    if (res.error)
        console.error(res.error);
    res.status.should.equal(201);
    return res.body;
}
describe("Post Test", async () => {
    it("Create Post - Ola", async () => {
        const data = {
            image: "https://picsum.photos/200/300",
            content: "This is Ola's post",
        };
        const res = await createOlaPost(data);
        testData_1.default.userOla.doc = res.data;
    });
    it("Create Post - David", async () => {
        const data = {
            image: "https://picsum.photos/200/300",
            content: "This is David's post",
        };
        const res = await createDavidPost(data);
        testData_1.default.userDavid.doc = res.data;
    });
    it("List Ola Posts", async () => {
        const res = await (0, supertest_1.default)(app_1.default).get("/api/posts").set("x-auth-token", testData_1.default.userOla.token);
        if (res.error)
            console.error(res.error);
        res.status.should.equal(200);
        res.body.data.length.should.equal(1);
    });
    it("List David Posts", async () => {
        const res = await (0, supertest_1.default)(app_1.default).get("/api/posts").set("x-auth-token", testData_1.default.userDavid.token);
        if (res.error)
            console.error(res.error);
        res.status.should.equal(200);
        res.body.data.length.should.equal(1);
    });
    it("List All Posts", async () => {
        const res = await (0, supertest_1.default)(app_1.default).get("/api/post/getAll").set("x-auth-token", testData_1.default.userOla.token);
        if (res.error)
            console.error(res.error);
        res.status.should.equal(200);
        res.body.data.length.should.equal(2);
    });
    it("Get Ola's First Post", async () => {
        const res = await (0, supertest_1.default)(app_1.default).get(`/api/post/${testData_1.default.userOla.doc._id}`).set("x-auth-token", testData_1.default.userOla.token);
        if (res.error)
            console.error(res.error);
        res.status.should.equal(200);
        res.body.data.content.should.equal("This is Ola's post");
    });
});
//# sourceMappingURL=02.post.test.js.map