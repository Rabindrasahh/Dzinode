const express = require("express");
const router = express.Router();

const transactionController = require("../controllers/transaction");
const auth = require("../middlewares/auth");
const isTalent = require("../middlewares/isTalent");
const isAdmin = require("../middlewares/isAdmin");

router.post("/new", auth, isTalent, transactionController.newTransaction);
router.get("/talent", auth, isTalent, transactionController.getTalentTransactions);
router.get("/get-all", auth, isAdmin, transactionController.getAllTransactions);
router.get("/edit/:transactionId", auth, isAdmin, transactionController.editTransaction);

module.exports = router;
