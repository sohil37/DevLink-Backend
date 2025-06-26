const Connections = require("../models/Connections");
const Endorsements = require("../models/Endorsements");
const ApiError = require("../utils/helperClasses");
const { setResponseJson } = require("../utils/helperFunctions");

const sendEndorsements = async (req, res, session) => {
  const logger = req.loggerWithRoute;
  try {
    const senderId = req.userId; // from authMiddleware
    let receiverId = req.body.userId;
    logger.info(
      `Send Endorsements Initiated: User "${senderId}" -> User "${receiverId}"`
    );
    let skills = req.body.skills;
    if (senderId === receiverId)
      throw new ApiError(
        `Send Endorsements Failed: User "${senderId}" tried endorsing itself`,
        "You can't endorse yourself",
        400,
        {
          requestStatus: "illegalRequest",
        }
      );
    const connection = await Connections.findOne({
      $or: [
        { sender: senderId },
        { receiver: senderId },
        { sender: receiverId, receiver: receiverId },
      ],
      status: "accepted",
    }).session(session);
    if (!connection)
      throw new ApiError(
        `Send Endorsements Failed: User "${senderId}" tried endorsing non-connected member "${receiverId}"`,
        "You can't endorse a non-connected member",
        400,
        {
          requestStatus: "illegalRequest",
        }
      );
    let endorsements = await Endorsements.findOne({
      endorsedBy: senderId,
      endorsedTo: receiverId,
    }).session(session);
    if (!endorsements) endorsements = new Endorsements();
    endorsements.$set({ endorsedBy: senderId, endorsedTo: receiverId, skills });
    await endorsements.save({ session });
    logger.info(
      `Send Endorsements Successful: User "${senderId}" -> User "${receiverId}"`
    );
    setResponseJson({
      res,
      status: 200,
      msg: "Endorsements sent successfully",
      id: endorsements._id,
    });
    logger.info(
      `Successful Response Sent for endorsement: User "${senderId}" -> User "${receiverId}"`
    );
  } catch (err) {
    throw err;
  }
};

const getEndorsements = async (req, res, session) => {
  const logger = req.loggerWithRoute;
  try {
    const userId = req.userId; // from authMiddleware
    logger.info(
      `Get Endorsements Requested: User = "${userId}", User Type = "${req.body?.type}"`
    );
    let endorsFilter =
      req.body?.type === "sender"
        ? { endorsedBy: userId }
        : { endorsedTo: userId };
    setResponseJson({
      res,
      msg: "Endorsements",
      data: await Endorsements.find({
        ...endorsFilter,
      })
        .lean()
        .session(session),
    });
    logger.info(`Endorsements sent successfully to user "${userId}"`);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  sendEndorsements,
  getEndorsements,
};
