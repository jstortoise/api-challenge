"use strict";

const _ = require("lodash");
const { expect } = require("chai");
const { server } = require("./config/test.server.js");
const sequelize = require("../config/sequelize/setup.js");
const Test = require("./config/test.utils.js");

const uri = `${server.info.uri}/v0`;
const scope = {};

describe("User CRUD operations -", () => {
  before(async () => {
    await Test.setupDb();
    return Promise.resolve();
  });

  describe("GET /users/{userId}", () => {
    it("should read a given user's information if requester is an admin", async () => {
      // Create a user and a JWT access token for that user
      scope.adminUser = await sequelize.models.User.create({
        email: `admin@example.com`,
      });
      scope.adminAccessToken = await scope.adminUser.generateAccessToken();

      // Add the admin role for the user
      await Test.assignRoleForUser({
        user: scope.adminUser,
        roleName: "admin",
      });

      // Make the request
      const { statusCode, result } = await server.inject({
        method: "get",
        url: `${uri}/users/${scope.adminUser.id}`,
        headers: {
          authorization: `Bearer ${scope.adminAccessToken}`,
        },
      });

      console.log('Ret result', result)

      // Check the response
      expect(statusCode).to.equal(200);
      expect(statusCode).to.equal(200);
      expect(result.id).to.equal(scope.adminUser.id);
      expect(result.uuid).to.equal(scope.adminUser.uuid);
      expect(result.email).to.equal(scope.adminUser.email);

      return Promise.resolve();
    });
    it("should return 401 unauthorized if requester is not an admin", async () => {
      // Create a user and a JWT access token for that user
      scope.user = await sequelize.models.User.create({
        email: `user@example.com`,
      });
      scope.accessToken = await scope.user.generateAccessToken();

      // Make the request
      const { statusCode, result } = await server.inject({
        method: "get",
        url: `${uri}/users/${scope.user.id}`,
        headers: {
          authorization: `Bearer ${scope.accessToken}`,
        },
      });

      // Check the response
      expect(statusCode).to.equal(401);
      expect(result.message).to.exist;
      expect(result.message).to.deep.equal("Unauthorized");

      return Promise.resolve();
    });
  });

  describe("GET /self", () => {
    it("should read own information", async () => {
      // Create a user and a JWT access token for that user
      scope.user = await sequelize.models.User.create({
        email: `user@example.com`,
      });
      scope.accessToken = await scope.user.generateAccessToken();

      // Add 2 roles to the user
      await Test.assignRoleForUser({
        user: scope.user,
        roleName: "owner",
      });
      await Test.assignRoleForUser({
        user: scope.user,
        roleName: "member",
      });

      // Make the request
      const { statusCode, result } = await server.inject({
        method: "get",
        url: `${uri}/users/self`,
        headers: {
          authorization: `Bearer ${scope.accessToken}`,
        },
      });

      // Assert a proper response
      expect(statusCode).to.equal(200);
      expect(result.id).to.equal(scope.user.id);
      expect(result.uuid).to.equal(scope.user.uuid);
      expect(result.email).to.equal(scope.user.email);
      expect(result.roles.length).to.equal(2);
      expect(result.roles).to.have.members(["owner", "member"]);

      return Promise.resolve();
    });
  });
});
