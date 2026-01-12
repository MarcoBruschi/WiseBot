import mongoose from "mongoose";

const topicSchema = mongoose.Schema({
  "id": { type: mongoose.Types.ObjectId },
  "title": { type: String, required: true },
  "detailed_analysis": { type: String, required: true },
  "links": { type: [String] }
});

const Topic = mongoose.model("topics", topicSchema);

export default Topic;