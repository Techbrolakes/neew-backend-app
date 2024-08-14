import chai from "chai";
import Debug from "debug";
import request from "supertest";

import app from "../app";
import testData from "./testData";

const debug = Debug("neew:02.post.test");

chai.should();

async function createOlaPost(data: any) {
  const res = await request(app) //
    .post("/api/post/create")
    .set("x-auth-token", testData.userOla.token)
    .send(data);

  if (res.error) console.error(res.error);

  res.status.should.equal(201);
  return res.body;
}

async function createDavidPost(data: any) {
  const res = await request(app) //
    .post("/api/post/create")
    .set("x-auth-token", testData.userDavid.token)
    .send(data);

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
    testData.userOla.post = res.data;
  });

  it("Create Post - David", async () => {
    const data = {
      image: "https://picsum.photos/200/300",
      content: "This is David's post",
    };

    const res = await createDavidPost(data);
    testData.userDavid.post = res.data;
  });

  it("List Ola Posts", async () => {
    const res = await request(app)
      .get(`/api/posts/user-posts/${testData.userOla.doc._id}`) //
      .set("x-auth-token", testData.userOla.token);

    if (res.error) console.error(res.error);

    res.status.should.equal(200);
    res.body.data.length.should.equal(1);
  });

  it("List David Posts", async () => {
    const res = await request(app)
      .get(`/api/posts/user-posts/${testData.userDavid.doc._id}`) //
      .set("x-auth-token", testData.userDavid.token);

    if (res.error) console.error(res.error);

    res.status.should.equal(200);
    res.body.data.length.should.equal(1);
  });

  it("List All Posts", async () => {
    const res = await request(app)
      .get("/api/posts/list") //
      .set("x-auth-token", testData.userOla.token);

    if (res.error) console.error(res.error);

    res.status.should.equal(200);
    res.body.data.length.should.equal(2);
  });

  it("Get Ola's First Post", async () => {
    const res = await request(app)
      .get(`/api/post/${testData.userOla.post._id}`) //
      .set("x-auth-token", testData.userOla.token);

    if (res.error) console.error(res.error);

    res.status.should.equal(200);
    res.body.data.content.should.equal("This is Ola's post");
  });

  it("Edit Ola's First Post", async () => {
    const data = {
      content: "This is Ola's edited post",
      postId: testData.userOla.post._id,
      image: "https://picsum.photos/200/300",
    };

    const res = await request(app)
      .put("/api/post/edit") //
      .set("x-auth-token", testData.userOla.token)
      .send(data);

    if (res.error) console.error(res.error);

    res.status.should.equal(200);
    res.body.data.content.should.equal("This is Ola's edited post");
  });

  it("Add Comment to Ola's First Post", async () => {
    const data = {
      postId: testData.userOla.post._id,
      comment: "This is a good post",
    };

    const res = await request(app)
      .post("/api/post/add-comment") //
      .set("x-auth-token", testData.userDavid.token)
      .send(data);

    if (res.error) console.error(res.error);

    res.status.should.equal(201);
    res.body.data.comments.length.should.equal(1);
    res.body.data.comments[0].comment.should.equal("This is a good post");
    res.body.data.comments[0].user.should.equal(testData.userDavid.doc._id);
  });

  it("Add Like to Ola's Post", async () => {
    const data = {
      postId: testData.userDavid.post._id,
    };

    const res = await request(app)
      .post("/api/post/add-like") //
      .set("x-auth-token", testData.userDavid.token)
      .send(data);

    if (res.error) console.error(res.error);

    res.status.should.equal(201);
    res.body.data.totalLikes.should.equal(1);
  });

  it("Delete David's Post", async () => {
    const res = await request(app)
      .delete(`/api/post/delete/${testData.userDavid.post._id}`) //
      .set("x-auth-token", testData.userDavid.token);

    if (res.error) console.error(res.error);

    res.status.should.equal(200);
    res.body.message.should.equal("Post deleted");
  });
});
