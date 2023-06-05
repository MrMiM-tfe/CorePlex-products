import mongoose from "mongoose";
import { IProductComment } from "../types/productComment";

const CommentSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true
        },
        body:{
            type:String,
            required:true
        },
        product:{
            type:mongoose.Types.ObjectId,
            ref:"Product",
            required:true
        },
        user:{
            type:mongoose.Types.ObjectId,
            ref:"User",
            required:true
        },
        parent:{
            type:mongoose.Types.ObjectId,
            ref:"Product_Comment",
        },
        state:{
            type: String,
            enum:["accepted", "waiting", "rejected", "parent_deleted"],
            default: "waiting"
        }
    },
    {
        timestamps: true,
    }
);

CommentSchema.index({ product: 1, user: 1 });


CommentSchema.virtual("children", {
    ref:"Product_Comment",
    localField: "_id",
    foreignField:"parent"
})

export default mongoose.model<IProductComment>("Product_Comment", CommentSchema)