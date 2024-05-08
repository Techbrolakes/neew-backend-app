import chai from "chai";
import Debug from "debug";
import request from "supertest";

import app from "../app";
import testData from "./testData";

const debug = Debug("neew:01.user.test");

chai.should();

describe("User Test", async () => {
  it("Register Ola - Success", async () => {
    const res = await request(app) //
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
    const res = await request(app) //
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
    const res = await request(app) //
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
    const res = await request(app) //
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
    testData.userOla.token = res.body.data.token;
  });

  it("Login David Bajomo - Success", async () => {
    const res = await request(app) //
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
    testData.userDavid.token = res.body.data.token;
  });
});
