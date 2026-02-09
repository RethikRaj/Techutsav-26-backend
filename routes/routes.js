"use strict";

import express from "express";

import {
  signupUser,
  verifyEmail,
  resendEmail,
  loginUser,
  loginUserDefaultNext,
  forgotPassword,
  resetPassword,
  getProfile,
  logoutUser,
} from "../controller/Usercontroller.js";
import {
  createEvent,
  getAllEvents,
  getMyEvents,
  updateEvent,
} from "../controller/Eventcontroller.js";
import {
  createCollege,
  deleteCollege,
  getAllColleges,
  updateCollege,
} from "../controller/Collegecontroller.js";
import {
  getRegisteredEvents,
  registerEvent,
} from "../controller/EventRegistrationController.js";
import {
  uploadPaymentInfo,
  viewAllPayments,
  updatePaymentStatus,
} from "../controller/PaymentController.js";

import { upload } from "../middleware/upload.js";

import { requireAuth } from "../middleware/auth.js";
import { standardResponse } from "../helper/helper.js";

const router = express.Router();

router.post("/user/signup", signupUser);

// router.post("/user/login", loginUser, loginUserDefaultNext);
router.post("/user/login", loginUser);

router.get("/user/profile", requireAuth, getProfile);

router.post("/user/logout", requireAuth, logoutUser);

router.get("/verify", verifyEmail);

router.get("/resend-email", resendEmail);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.post("/college/create", createCollege);

router.get("/college/all", getAllColleges);

router.put("/college/update/:id", updateCollege);

router.delete("/college/delete/:id", deleteCollege);

router.post("/event/create", requireAuth, createEvent);

router.get("/event/all", getAllEvents);

router.put("/event/update/:eventId", requireAuth, updateEvent);
router.get("/event/my-events", requireAuth, getMyEvents);

router.post("/event/register/:eventId", requireAuth, registerEvent);

router.get("/event/registered-events", requireAuth, getRegisteredEvents);

router.post(
  "/Upload-Payment-Info",
  requireAuth,
  upload.single("screenshot"),
  uploadPaymentInfo,
);

router.get(
  "/View-All-Payments",
  requireAuth,
  (req, res, next) => {
    if (req.user.role !== "PaymentAdmin") {
      return res.status(403).json(standardResponse(403, "Access denied"));
    }
    next();
  },
  viewAllPayments,
);

router.put(
  "/Update-Payment-Status/:paymentId",
  requireAuth,
  (req, res, next) => {
    if (req.user.role !== "PaymentAdmin") {
      return res.status(403).json(standardResponse(403, "Access denied"));
    }
    next();
  },
  updatePaymentStatus,
);

export default router;
