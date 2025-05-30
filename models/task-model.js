import { Schema, model } from "mongoose";

const taskSchema = new Schema({
    id: String,
    type: String,
    number: Number,
    title: String,
    description: String,
    reward: Number
})
export default model("Task", taskSchema);