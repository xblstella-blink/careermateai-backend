const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Student", "Other"],
    },
    field: {
      type: String,
      enum: ["FE", "BE"],
    },
    goal: { type: String, trim: true },
    avatar: { type: String },
    displayName: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_, ret) {
        delete ret.password;
        delete ret.__v;
      },
    },
  },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
