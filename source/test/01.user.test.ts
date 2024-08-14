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
        interest: ["entrepreneur"],
        industry: ["technology"],
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
        email: "bajomodavid18@gmail.com",
        password: "Testing123",
        firstName: "David",
        lastName: "Bajomo",
        location: "Paris, France",
        interest: ["investor"],
        industry: ["technology"],
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

    testData.userOla.token = "local:" + (res.body.data.token as string);
  });

  it("Login David Bajomo - Success", async () => {
    const res = await request(app) //
      .post("/api/auth/login")
      .send({
        email: "bajomodavid18@gmail.com",
        password: "Testing123",
      });

    if (res.error) {
      console.error(res.error);
    }

    res.status.should.equal(200);
    (res.body.data.token !== undefined).should.be.true;

    testData.userDavid.token = "local:" + (res.body.data.token as string);
  });

  it("Get Me - Ola", async () => {
    const res = await request(app) //
      .get("/api/profile/me")
      .set("x-auth-token", testData.userOla.token);

    if (res.error) {
      console.error(res.error);
    }

    testData.userOla.doc = res.body.data;
    res.status.should.equal(200);
    res.body.data.firstName.should.equal("ola");
    res.body.data.lastName.should.equal("daramola");
    res.body.data.email.should.equal("lekandar11@gmail.com");
    res.body.data.interest[0].should.equal("entrepreneur");
    res.body.data.location.should.equal("Gbagada, Lagos");
  });

  it("Get Me - David", async () => {
    const res = await request(app) //
      .get("/api/profile/me")
      .set("x-auth-token", testData.userDavid.token);

    if (res.error) {
      console.error(res.error);
    }

    testData.userDavid.doc = res.body.data;
    res.status.should.equal(200);
    res.body.data.firstName.should.equal("david");
    res.body.data.lastName.should.equal("bajomo");
    res.body.data.email.should.equal("bajomodavid18@gmail.com");
    res.body.data.interest[0].should.equal("investor");
    res.body.data.location.should.equal("Paris, France");
  });
});
