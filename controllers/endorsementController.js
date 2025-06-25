const Connections = require("../models/Connections");
const Endorsements = require("../models/Endorsements");
const ApiError = require("../utils/helperClasses");
const { setResponseJson } = require("../utils/helperFunctions");

const sendEndorsements = async (req, res, session) => {
  try {
    const senderId = req.userId; // from authMiddleware
    let receiverId = req.body.userId;
    let skills = req.body.skills;
    if (senderId === receiverId)
      return setResponseJson({
        res,
        status: 400,
        msg: "You can't endorse yourself",
        requestStatus: "illegalRequest",
      });
    const connection = await Connections.findOne({
      $or: [
        { sender: senderId },
        { receiver: senderId },
        { sender: receiverId, receiver: receiverId },
      ],
      status: "accepted",
    }).session(session);
    if (!connection)
      return setResponseJson({
        res,
        status: 400,
        msg: "You can't endorse a non-connected member",
        requestStatus: "illegalRequest",
      });
    let endorsements = await Endorsements.findOne({
      endorsedBy: senderId,
      endorsedTo: receiverId,
    }).session(session);
    if (!endorsements) endorsements = new Endorsements();
    endorsements.$set({ endorsedBy: senderId, endorsedTo: receiverId, skills });
    await endorsements.save({ session });
    setResponseJson({
      res,
      status: 200,
      msg: "Endorsements sent successfully",
      id: endorsements._id,
    });
  } catch (err) {
    throw new ApiError();
  }
};

module.exports = {
  sendEndorsements,
};
