"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const debug_1 = __importDefault(require("debug"));
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const debug = (0, debug_1.default)("neew:01.user.test");
chai_1.default.should();
describe("User Test", async () => {
    it("Register - Success", async () => {
        const res = await (0, supertest_1.default)(app_1.default) //
            .post("/api/users/register")
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
});
//# sourceMappingURL=01.user.test.js.map