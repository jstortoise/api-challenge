const _ = require("lodash");
const routeUtils = require("./utils.route.js");
const User = require("../../models/user.js");

module.exports = [
  // Read self
  {
    method: "GET",
    path: "/users/self",
    config: {
      description: "Read a user",
      tags: ["Users"],
    },
    handler: async (request, h) => {
      try {
        const { user } = request.auth.credentials;
        const res = await user.findComplete();
        return routeUtils.replyWith.found(res, h);
      } catch (err) {
        return routeUtils.handleErr(err, h);
      }
    },
  },
  // Read user by userId
  {
    method: "GET",
    path: "/users/{userId}",
    config: {
      description: "Read a user by userId",
      tags: ["Users"],
    },
    handler: async (request, h) => {
      try {
        const { user } = request.auth.credentials;
        const { userId } = request.params;
        const res = await user.findOneByUserId(userId);
        console.log('Ret', res);
        return routeUtils.replyWith.found(res, h);
      } catch (e) {
        return routeUtils.handleErr(e, h);
      }
    }
  }
];
