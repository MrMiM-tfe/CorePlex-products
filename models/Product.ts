import mongoose from "mongoose";
import { IProduct } from "../types/product";
import { preSaveSlugGenerator } from "../helpers/general";

const ProductSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim:true
    },
    slug:{
        type:String,
        unique: true
    },
    type:{
        type:String,
        enum:["single", "children", "mother"],
        default: "single"
    },
    mother: {
        type:mongoose.Types.ObjectId,
        ref:"Product"
    },
    coverImage:{
        type:String
    },
    images:{
        type:[String]
    },
    shortDes:{
        type:String
    },
    des:{
        type:String
    },
    categories:{
        type:[mongoose.Types.ObjectId],
        ref:"Product_Category"
    },
    sellerId:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    price:{
        type:Number,
        default: 0
    },
    specialPrice:{
        type:Number,
    },
    quantity:{
        type:Number,
        default: 1
    },
    sold:{
        type:Number,
        default:0
    },
    isOutOfStock:{
        type:Boolean,
        default: false
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: (val:number) => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    }

},{
    timestamps: true
})


ProductSchema.index({name: "text", shortDes: "text"})

ProductSchema.index(
    { name: 1, price: 1, sold: 1, ratingsAverage: -1 },
    { unique: true }
);
ProductSchema.index({ slug: 1 })

ProductSchema.virtual('comments', {
    ref: "Product_Comment",
    foreignField: "product", // product filed in Product_Comment Model
    localField: '_id' // _id filed in Product Model
})

ProductSchema.virtual("seller", {
    ref:"User",
    foreignField: "_id",
    localField: "sellerId",
    justOne: true
})

// validate mother field
ProductSchema.pre("save", function (next) {
    if (this.type === "children" && !this.mother){
        next(new Error("mother is required when type is children"))
    }
    next()
})

// generate slug
ProductSchema.pre("save", preSaveSlugGenerator)

export default mongoose.model<IProduct>("Product", ProductSchema)