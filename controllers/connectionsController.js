const Connections = require("../models/Connections");
const ApiError = require("../utils/helperClasses");
const { setResponseJson } = require("../utils/helperFunctions");

const sendConnRequest = async (req, res, session) => {
  try {
    const senderId = req.userId; // from authMiddleware
    let receiverId = req.body.userId;
    if (senderId === receiverId)
      return setResponseJson({
        res,
        status: 400,
        msg: "You can't connect with yourself",
        requestStatus: "illegalRequest",
      });
    const connection = await Connections.findOne({
      sender: senderId,
      receiver: receiverId,
    }).session(session);
    if (connection) {
      return setResponseJson({
        res,
        status: 409,
        msg: "Connection request already exists",
        requestStatus: "alreadyExists",
      });
    } else {
      const connections = new Connections({
        sender: senderId,
        receiver: receiverId,
      });
      await connections.save({ session });
      setResponseJson({
        res,
        status: 201,
        msg: "Connection request sent successfully",
        requestStatus: "created",
      });
    }
  } catch (err) {
    throw new ApiError();
  }
};

const removeConnRequest = async (req, res, session) => {
  try {
    const senderId = req.userId; // from authMiddleware
    let receiverId = req.body.userId;
    await Connections.deleteOne({
      sender: senderId,
      receiver: receiverId,
    }).session(session);
    return setResponseJson({
      res,
      status: 200,
      msg: "Connection request removed successfully",
      requestStatus: "removed",
    });
  } catch (err) {
    throw new ApiError();
  }
};

module.exports = { sendConnRequest, removeConnRequest };
