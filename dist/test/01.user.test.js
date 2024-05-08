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
const debug = (0, debug_1.default)("neew:01.user.test");
chai_1.default.should();
describe("User Test", async () => {
    it("Register Ola - Success", async () => {
        const res = await (0, supertest_1.default)(app_1.default) //
            .post("/api/auth/register")
            .send({
            email: "lekandar11@gmail.com",
            password: "Testing123",
            firstName: "Ola",
            lastName: "Daramola",
            interest: "entrepreneur",
            location: "Gbagada, Lagos",
        });
        if (res.error) {
            console.error(res.error);
        }
        res.status.should.equal(201);
    });
    it("Register David - Success", async () => {
        const res = await (0, supertest_1.default)(app_1.default) //
            .post("/api/auth/register")
            .send({
            email: "lekandaramola11@gmail.com",
            password: "Testing123",
            firstName: "David",
            lastName: "Bajomo",
            interest: "entrepreneur",
            location: "Paris, France",
        });
        if (res.error) {
            console.error(res.error);
        }
        res.status.should.equal(201);
    });
    it("Login - Ola Wrong Password", async () => {
        const res = await (0, supertest_1.default)(app_1.default) //
            .post("/api/auth/login")
            .send({
            email: "lekandar11@gmail.com",
            password: "wrong password",
        });
        if (res.status !== 400 && res.error) {
            console.error(res.error);
        }
        res.status.should.equal(400);
        (res.body.token === undefined).should.be.true;
    });
    it("Login Ola - Success", async () => {
        const res = await (0, supertest_1.default)(app_1.default) //
            .post("/api/auth/login")
            .send({
            email: "lekandar11@gmail.com",
            password: "Testing123",
        });
        if (res.error) {
            console.error(res.error);
        }
        res.status.should.equal(200);
        (res.body.data.token !== undefined).should.be.true;
        testData_1.default.userOla.token = res.body.data.token;
    });
    it("Login David Bajomo - Success", async () => {
        const res = await (0, supertest_1.default)(app_1.default) //
            .post("/api/auth/login")
            .send({
            email: "lekandaramola11@gmail.com",
            password: "Testing123",
        });
        if (res.error) {
            console.error(res.error);
        }
        res.status.should.equal(200);
        (res.body.data.token !== undefined).should.be.true;
        testData_1.default.userDavid.token = res.body.data.token;
    });
});
//# sourceMappingURL=01.user.test.js.map