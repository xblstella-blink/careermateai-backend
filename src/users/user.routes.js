const { Router } = require("express");
const userController = require("./user.controller");
const authGuard = require("../middleware/authGuard.middleware");
const { updateMeSchema, updateMyPasswordSchema } = require("./user.validation");
const validate = require("../middleware/validation.middleware");
const { roleGuard } = require("../middleware/roleGuard.middleware");

const userRouter = Router();

userRouter.use(authGuard);

userRouter.get("/me", userController.getMe);
userRouter.patch("/me", validate(updateMeSchema), userController.updateMe);
userRouter.patch(
  "/me/password",
  validate(updateMyPasswordSchema),
  userController.updateMyPassword,
);

userRouter.delete("/:id", roleGuard("admin"), userController.deleteUser);
userRouter.patch(
  "/:id/restore",
  roleGuard("admin"),
  userController.restoreUser,
);

module.exports = userRouter;
