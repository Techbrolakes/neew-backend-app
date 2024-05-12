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
const debug = (0, debug_1.default)("neew:03.follow.test");
chai_1.default.should();
describe("Follow Test", async () => {
    it("Lekan follows david", async () => {
        const data = {
            follower: testData_1.default.userOla.doc._id,
            followee: testData_1.default.userDavid.doc._id,
        };
        const res = await (0, supertest_1.default)(app_1.default) //
            .post("/api/user/follow")
            .set("x-auth-token", testData_1.default.userOla.token)
            .send(data);
        if (res.error)
            console.error(res.error);
        res.status.should.equal(200);
    });
    it("David follows lekan", async () => {
        const res = await (0, supertest_1.default)(app_1.default) //
            .post("/api/user/follow")
            .set("x-auth-token", testData_1.default.userDavid.token)
            .send({
            follower: testData_1.default.userDavid.doc._id,
            followee: testData_1.default.userOla.doc._id,
        });
        if (res.error)
            console.error(res.error);
        res.status.should.equal(200);
    });
    it("Get followers of Lekan", async () => {
        const res = await (0, supertest_1.default)(app_1.default) //
            .get(`/api/user/followers/${testData_1.default.userOla.doc._id}`)
            .set("x-auth-token", testData_1.default.userOla.token);
        if (res.error)
            console.error(res.error);
        res.status.should.equal(200);
        res.body.data.followers.length.should.equal(1);
        res.body.data.following.length.should.equal(1);
    });
    it("Get followers of David", async () => {
        const res = await (0, supertest_1.default)(app_1.default) //
            .get(`/api/user/followers/${testData_1.default.userDavid.doc._id}`)
            .set("x-auth-token", testData_1.default.userDavid.token);
        if (res.error)
            console.error(res.error);
        res.status.should.equal(200);
        res.body.data.followers.length.should.equal(1);
        res.body.data.following.length.should.equal(1);
    });
});
//# sourceMappingURL=03.follow.test.js.map