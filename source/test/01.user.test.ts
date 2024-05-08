import chai from "chai";
import Debug from "debug";
import request from "supertest";

import app from "../app";
import testData from "./testData";

const debug = Debug("neew:01.user.test");

chai.should();

describe("User Test", async () => {
  it("Register - Success", async () => {
    const res = await request(app) //
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
