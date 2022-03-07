const express = require("express");
const router = express.Router();

const siteController = require("../controllers/site.js");
const auth = require("../middlewares/auth");

router.get("/get-index-data", siteController.getHomeData);

router.post("/book-video", auth, siteController.bookVideo);
router.get("/get-payment-intent", auth, siteController.getPaymentIntent);
router.get("/user-profile", auth, siteController.getUserProfile);
router.put("/user/update-profile", auth, siteController.updateUserProfile);

router.get("/pending-orders", auth, siteController.getPendingOrders); // needs user mdl
router.get("/completed-orders", auth, siteController.getCompletedOrders); // needs user mdl
router.get("/accept-order/:orderId", auth, siteController.acceptPendingOrder); // needs user mdl
router.get("/reject-order/:orderId", auth, siteController.rejectPendingOrder); // needs user mdl
router.get("/download-video/:orderId", auth, siteController.downloadVideo); // needs user mdl
router.get("/copy-video-link/:orderId", siteController.copyVideoLink); // needs user mdl
router.put("/submit-review/:orderId", auth, siteController.submitReview); // needs user mdl

router.get("/articles", siteController.getArticles);
router.get("/articles/:articleId", siteController.getSingleArticle);

router.get("/bookmark/:talentId", auth, siteController.getIsBookmarked);
router.get("/bookmarks", auth, siteController.getBookmarks);
router.delete("/bookmark/:talentId", auth, siteController.deleteBookmark);
router.patch("/bookmark/:talentId", auth, siteController.patchBookmark);

module.exports = router;
