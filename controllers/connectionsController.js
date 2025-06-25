const Connections = require("../models/Connections");
const UserProfile = require("../models/UserProfile");
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
    const reverseConnection = await Connections.findOne({
      sender: receiverId,
      receiver: senderId,
    }).session(session);
    if (connection || reverseConnection)
      return setResponseJson({
        res,
        status: 409,
        msg: "Connection request already exists",
        requestStatus: "alreadyExists",
      });
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
      id: connections._id,
    });
  } catch (err) {
    throw new ApiError();
  }
};

const acceptConnRequest = async (req, res, session) => {
  try {
    const userId = req.userId; // from authMiddleware
    const connection = await Connections.findOne({
      _id: req.body.connId,
      receiver: userId,
    }).session(session);
    if (!connection)
      return setResponseJson({
        res,
        status: 400,
        msg: "Invalid connection Id",
      });
    connection.status = "accepted";
    await connection.save({ session });
    return setResponseJson({
      res,
      status: 200,
      msg: "Connection request accepted successfully",
      requestStatus: "accepted",
    });
  } catch (err) {
    throw new ApiError();
  }
};

const removeConnRequest = async (req, res, session) => {
  try {
    await Connections.deleteOne({
      _id: req.body.connId,
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

const getConnections = async (req, res, session) => {
  try {
    const userId = req.userId; // from authMiddleware
    let connFilter =
      req.body?.type === "sender"
        ? { sender: userId }
        : req.body?.type === "receiver"
        ? { receiver: userId }
        : {
            $or: [{ sender: userId }, { receiver: userId }],
          };
    const connections = await Connections.find({
      ...connFilter,
      status: req.body?.connStatus,
    })
      .lean()
      .session(session);
    const receiverIds = connections.map((conn) => conn.receiver);
    const userProfiles = await UserProfile.find({
      _id: { $in: receiverIds },
    }).session(session);
    const profileMap = new Map(
      userProfiles.map((profile) => [profile._id.toString(), profile])
    );
    const result = connections.map((conn) => ({
      ...conn,
      receiverProfile: profileMap.get(conn.receiver.toString()) || null,
    }));
    setResponseJson({ res, msg: "Connections", data: result });
  } catch (err) {
    throw new ApiError();
  }
};

module.exports = {
  sendConnRequest,
  acceptConnRequest,
  removeConnRequest,
  getConnections,
};
