import Community from "../models/Community.js";

export const requireMember = async (req, res, next) => {
  next(); // everyone is at least a member
};

export const requireAdminOrOwner = async (req, res, next) => {
  try {
    const communityId = req.params.communityId || req.body.communityId;
    const userId = req.user.userId;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    const member = community.members.find(m => m.userId.toString() === userId);

    if (!member) return res.status(403).json({ message: "Not in this community" });

    if (member.role !== "admin" && member.role !== "owner")
      return res.status(403).json({ message: "Insufficient permissions" });

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const requireOwner = async (req, res, next) => {
  try {
    const communityId = req.params.communityId || req.body.communityId;
    const userId = req.user.userId;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    if (community.ownerId.toString() !== userId)
      return res.status(403).json({ message: "Owner access only" });

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
