import chai from "chai";
import Debug from "debug";
import request from "supertest";

import app from "../app";
import testData from "./testData";

const debug = Debug("neew:03.follow.test");

chai.should();

describe("Follow Test", async () => {
  it("Lekan follows david", async () => {
    const res = await request(app) //
      .post("/api/user/follow")
      .set("x-auth-token", testData.userOla.token)
      .send({
        follower: testData.userOla.doc._id,
        followee: testData.userDavid.doc._id,
      });

    if (res.error) console.error(res.error);

    res.status.should.equal(200);
  });

  it("David follows lekan", async () => {
    const res = await request(app) //
      .post("/api/user/follow")
      .set("x-auth-token", testData.userDavid.token)
      .send({
        follower: testData.userDavid.doc._id,
        followee: testData.userOla.doc._id,
      });

    if (res.error) console.error(res.error);

    res.status.should.equal(200);
  });

  it("Get followers of Lekan", async () => {
    const res = await request(app) //
      .get(`/api/user/followers/${testData.userOla.doc._id}`)
      .set("x-auth-token", testData.userOla.token);

    if (res.error) console.error(res.error);

    res.status.should.equal(200);
    res.body.data.followers.length.should.equal(1);
    res.body.data.following.length.should.equal(1);
  });
});
