import mongoose from "mongoose";
import {GenerateSlug} from "../helpers/general";
import {IProductCategory} from "../types/productCategory";

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
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
);

CategorySchema.index({slug: 1})

// set products virtual
CategorySchema.virtual('products', {
    ref: "Product",
    foreignField: 'categories',
    localField: '_id'
})

CategorySchema.pre("save", async function (this: IProductCategory, next: Function) {

    this.slug = await GenerateSlug(this, mongoose.models.Product_Category)

    next()
})

export default mongoose.model<IProductCategory>("Product_Category", CategorySchema)