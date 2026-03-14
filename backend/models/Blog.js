const mongoose = require("mongoose");

const blogCommentSchema = new mongoose.Schema({
  commenter_name: { type: String, required: true },
  commenter_email: { type: String, required: true },
  comment: String,
  status: { type: String, default: "pending" },
  created_at: { type: Date, default: Date.now },
});

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: "" },
  excerpt: String,
  image: String,
  author_name: { type: String, required: true },
  author_email: { type: String, required: true },
  status: { type: String, default: "draft" },
  comments: [blogCommentSchema],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Blog", blogSchema);
