const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");
const authMiddleware = require("../middlewares/auth.js");
const isAdmin = require("../middlewares/isAdmin");

router.post("/talent", authMiddleware, isAdmin, adminController.addTalent);
router.get("/talent-all-info/:talentId", authMiddleware, isAdmin, adminController.getTalentAllInfo);
router.get("/talent/search", authMiddleware, isAdmin, adminController.searchTalent);
router.get("/talent/pending", authMiddleware, isAdmin, adminController.getPendingTalents);
router.get("/talent/accepted", authMiddleware, isAdmin, adminController.getAcceptedTalents);
router.put("/talent/:talentId", authMiddleware, isAdmin, adminController.acceptTalent);
router.delete("/talent/:talentId", authMiddleware, isAdmin, adminController.deleteTalent);
router.put("/talent/edit/:talentId", authMiddleware, isAdmin, adminController.editTalent);

router.get("/category", authMiddleware, isAdmin, adminController.getCategories);
router.post("/category", authMiddleware, isAdmin, adminController.postCategory);
router.delete("/category/:categoryId", authMiddleware, isAdmin, adminController.deleteCategory);
router.put("/category/:categoryId", authMiddleware, isAdmin, adminController.putCategory);

router.get("/requests", authMiddleware, isAdmin, adminController.getAllRequests);
router.put("/edit-request/:requestId", authMiddleware, isAdmin, adminController.editRequest);
router.get(
    "/requests/download-video/:orderId",
    authMiddleware,
    isAdmin,
    adminController.downloadVideo
);

router.get("/requests/search", authMiddleware, isAdmin, adminController.searchRequests);
router.get("/requests/filter", authMiddleware, isAdmin, adminController.filterRequests);

router.get("/articles", authMiddleware, isAdmin, adminController.getArticles);
router.post("/articles", authMiddleware, isAdmin, adminController.addArticle);
router.put("/articles/:articleId", authMiddleware, isAdmin, adminController.editArticle);
router.delete("/articles/:articleId", authMiddleware, isAdmin, adminController.deleteArticle);

router.get("/users", authMiddleware, isAdmin, adminController.getUsers);
router.put("/users/:userId", authMiddleware, isAdmin, adminController.editUser);
router.delete("/users/:userId", authMiddleware, isAdmin, adminController.deleteUser);

router.post("/new-admin", authMiddleware, isAdmin, adminController.addAdmin);
router.put("/edit-admin", authMiddleware, isAdmin, adminController.editAdmin);

router.patch("/getaway", authMiddleware, isAdmin, adminController.patchGetawaySettings);

module.exports = router;
