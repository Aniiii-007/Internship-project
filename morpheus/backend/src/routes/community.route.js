import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getCommunityHistory } from "../controller/community.controller.js";

const communityRouter = Router();

// Apply auth middleware
communityRouter.use(authenticate);

// Get paginated history of community chat
communityRouter.get("/history", getCommunityHistory);

export default communityRouter;