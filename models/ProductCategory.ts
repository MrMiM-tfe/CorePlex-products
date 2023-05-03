import mongoose from "mongoose";
import { preSaveSlugGenerator } from "../helpers/model";
import { IProductCategory } from "../types/productCategory";

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            unique: true,
        },
        mother: {
            type: mongoose.Types.ObjectId,
            ref: "Product_Category",
        },
        des: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

CategorySchema.index({slug:1})

// set products virtual
CategorySchema.virtual('products', {
    ref: "Product",
    foreignField: 'categories',
    localField: '_id'
})

CategorySchema.pre("save", preSaveSlugGenerator)

export default mongoose.model<IProductCategory>("Product_Category", CategorySchema)