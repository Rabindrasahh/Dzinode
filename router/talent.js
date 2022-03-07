const express = require("express");
const router = express.Router();

const talentController = require("../controllers/talent");
const auth = require("../middlewares/auth");

router.get("/myself", auth, talentController.getTalentItself);
router.get("/my-reviews", auth, talentController.getMyReviews);
router.get("/my-videos", auth, talentController.getMyVideos);
router.put("/update-myself", auth, talentController.putUpdateTalentItself);
router.put("/update-intro-video", auth, talentController.putUpdateIntroVideo);
router.get("/pending-requests", auth, talentController.getPendingRequests);
router.get("/completed-requests", auth, talentController.getCompletedRequests);
router.get("/rejected-requests", auth, talentController.getRejectedRequests);
router.get("/accept-request/:orderId", auth, talentController.acceptPendingRequest);
router.get("/reject-request/:orderId", auth, talentController.rejectPendingRequest);
router.post("/upload-video/:orderId", auth, talentController.uploadVideo);

router.post("/join", talentController.postTalentJoin);
router.get("/talents", talentController.getAllTalents);
router.get("/search", talentController.searchTalents);
router.get("/category-search", talentController.searchTalentsByCategory);
router.get("/:talentId", talentController.getTalent);

module.exports = router;
