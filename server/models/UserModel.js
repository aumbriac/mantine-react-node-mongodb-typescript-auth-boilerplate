const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  accountLocked: Boolean
})

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);