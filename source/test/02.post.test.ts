import chai from "chai";
import Debug from "debug";
import request from "supertest";

import app from "../app";
import testData from "./testData";

const debug = Debug("neew:02.post.test");

async function createOlaPost(data: any) {
  const res = await request(app).post("/api/post/create").set("x-auth-token", testData.userOla.token).send(data);

  if (res.error) console.error(res.error);

  res.status.should.equal(201);
  return res.body;
}

async function createDavidPost(data: any) {
  const res = await request(app).post("/api/post/create").set("x-auth-token", testData.userDavid.token).send(data);

  if (res.error) console.error(res.error);

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
    testData.userOla.doc = res.data;
  });

  it("Create Post - David", async () => {
    const data = {
      image: "https://picsum.photos/200/300",
      content: "This is David's post",
    };

    const res = await createDavidPost(data);
    testData.userDavid.doc = res.data;
  });
});
