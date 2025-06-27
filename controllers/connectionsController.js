const Connections = require("../models/Connections");
const UserProfile = require("../models/UserProfile");
const ApiError = require("../utils/helperClasses");
const {
  setResponseJson,
  sanitizePublicProfile,
} = require("../utils/helperFunctions");

const sendConnRequest = async (req, res, session) => {
  const logger = req.loggerWithRoute;
  try {
    const senderId = req.userId; // from authMiddleware
    let receiverId = req.body.userId;
    logger.info(
      `Connection Request Initiated: User "${senderId}" -> User "${receiverId}"`
    );
    if (senderId === receiverId)
      throw new ApiError(
        `Connection Request Failed: User "${senderId}" tried connecting itself`,
        "You can't connect yourself",
        400,
        {
          requestStatus: "illegalRequest",
        }
      );
    const connection = await Connections.findOne({
      sender: senderId,
      receiver: receiverId,
    }).session(session);
    const reverseConnection = await Connections.findOne({
      sender: receiverId,
      receiver: senderId,
    }).session(session);
    if (connection || reverseConnection)
      throw new ApiError(
        `Connection Request Failed: Connection request already exist between user "${senderId}" and user "${receiverId}"`,
        "Connection request already exist",
        409,
        {
          requestStatus: "alreadyExists",
        }
      );
    const connections = new Connections({
      sender: senderId,
      receiver: receiverId,
    });
    await connections.save({ session });
    logger.info(
      `Connection Request Successful: User "${senderId}" -> User "${receiverId}"`
    );
    setResponseJson({
      res,
      status: 201,
      msg: "Connection request sent successfully",
      requestStatus: "created",
      id: connections._id,
    });
    logger.info(
      `Successful Response Sent for connection: User "${senderId}" -> User "${receiverId}"`
    );
  } catch (err) {
    throw err;
  }
};

const acceptConnRequest = async (req, res, session) => {
  const logger = req.loggerWithRoute;
  try {
    const userId = req.userId; // from authMiddleware
    const connId = req.body.connId;
    logger.info(
      `Accept connection requested by user "${userId}" for connection id "${connId}"`
    );
    const connection = await Connections.findOne({
      _id: connId,
      receiver: userId,
    }).session(session);
    if (!connection)
      throw new ApiError(
        `Accept Connection Failed: Invalid connection id "${connId}" sent by user "${userId}"`,
        "Invalid connection Id",
        400
      );
    connection.status = "accepted";
    await connection.save({ session });
    logger.info(
      `Connection accepted by user "${userId}" for connection id "${connId}"`
    );
    setResponseJson({
      res,
      msg: "Connection request accepted successfully",
      requestStatus: "accepted",
    });
    logger.info(
      `Successful response sent to user "${userId}" for connection id "${connId}"`
    );
  } catch (err) {
    throw err;
  }
};

const removeConnRequest = async (req, res, session) => {
  const logger = req.loggerWithRoute;
  try {
    const userId = req.userId; // from authMiddleware
    const connId = req.body.connId;
    logger.info(
      `Remove connection requested by user "${userId}" for connection id "${connId}"`
    );
    await Connections.deleteOne({
      _id: connId,
    }).session(session);
    logger.info(
      `Connection request removed by user "${userId}" for connection id "${connId}"`
    );
    setResponseJson({
      res,
      msg: "Connection request removed successfully",
      requestStatus: "removed",
    });
    logger.info(
      `Successful response sent to user "${userId}" for connection id "${connId}"`
    );
  } catch (err) {
    throw err;
  }
};

const getConnections = async (req, res, session) => {
  const logger = req.loggerWithRoute;
  try {
    const userId = req.userId; // from authMiddleware
    logger.info(
      `Get Connections Requested: User = "${userId}", User Type = "${req.body?.type}", Connection Status: "${req.body?.connStatus}"`
    );
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
      .populate("receiver")
      .lean()
      .session(session);
    const result = connections.map((conn) => {
      const { receiver, ...rest } = conn;
      return {
        ...rest,
        receiverProfile: sanitizePublicProfile(receiver),
      };
    });
    setResponseJson({ res, msg: "Connections", data: result });
    logger.info(`Connections sent successfully to user "${userId}"`);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  sendConnRequest,
  acceptConnRequest,
  removeConnRequest,
  getConnections,
};
