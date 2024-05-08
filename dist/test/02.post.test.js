"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const testData_1 = __importDefault(require("./testData"));
const debug = (0, debug_1.default)("neew:02.post.test");
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
});
//# sourceMappingURL=02.post.test.js.map