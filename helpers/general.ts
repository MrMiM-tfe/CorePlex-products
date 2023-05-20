import slugify from "slugify";
import {EStatusCodes, IPageData, IResultError} from "@/core/types/general";
import {IFilter, ProductResult} from "../types/product";
import Product from "../models/Product";
import mongoose, {isValidObjectId} from "mongoose";

export async function GenerateSlug(doc: any, model: mongoose.Model<any, {}, {}, {}, any>) {
    // check if slug is modified by user or not
    if (!ValidateSlug(doc.slug)) {
        doc.slug = slugify(doc.name)
    }

    const similar = await model.findOne({slug: doc.slug})
    if (!similar) return doc.slug as string

    const regexPattern = new RegExp(`^${doc.slug}-\\d+$`)

    const data = (await model.find({slug: regexPattern}).sort("-slug").limit(1))[0]
    console.log(data);
    
    if (data) {
        // get latest counter number
        const count = data.slug.split("-").pop()

        // generate next counter number
        const StrNumber = !isNaN(Number(count)) ? (Number(count) + 1).toString() : "1"

        // concatenate slug with number
        doc.slug = doc.slug + "-" + StrNumber
    }else {
        doc.slug = doc.slug + "-1"
    }

    return doc.slug as string
}

/**
 * @description validate slug
 */
export function ValidateSlug(slug: string) {
    
    if (!slug) return false
    
    const regexExp = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;
    return regexExp.test(slug)
}

export function handleModelErrors(error: any) {
    console.log(error);


    if (error.name === "ValidationError") {
        let errors: IResultError[] = [];

        Object.keys(error.errors).forEach((key) => {
            let err: IResultError = {
                name: key,
                message: error.errors[key].message,
                status: EStatusCodes.CONFLICT,
            };
            errors.push(err);
        });

        return ProductResult.error(errors, EStatusCodes.CONFLICT);
    } else if (error.code === 11000) {
        let errors: IResultError[] = [];

        Object.keys(error.keyValue).forEach((key) => {
            let err: IResultError = {
                name: key,
                message: `'${key}' must be unique. value of '${error.keyValue[key]}' is in use`,
                status: EStatusCodes.CONFLICT,
            };
            errors.push(err);
        });

        return ProductResult.error(errors, EStatusCodes.CONFLICT);
    }

    const err: IResultError = {
        name: "Server Error",
        message: "some thing went wrong",
        status: EStatusCodes.SERVER_ERROR,
    };

    return ProductResult.error(err, err.status);
}

export async function findProductByIdentity(identity: string) {
    const identityType = checkIdentity(identity);

    try {
        switch (identityType) {
            case "slug":
                return await Product.findOne({slug: identity});
            case "id":
                return await Product.findById(identity);
            default:
                return null;
        }
    } catch (error) {
        return null;
    }
}

export function checkIdentity(identity: string) {
    let identityType = "slug";
    if (isValidObjectId(identity)) {
        identityType = "id";
    }

    return identityType;
}

export function generateFilterObj(filter?: IFilter) {
    const filterObj: any = {};
    if (filter && filter.brands && filter.brands.length > 0) {
        filterObj.$or = filter.brands.map((brand: string) => ({brand}));
    }
    if (filter && filter.price) {
        filterObj.price = {};
        if (filter.price.min) {
            filterObj.price.$gte = filter.price.min;
        }
        if (filter.price.max) {
            filterObj.price.$lte = filter.price.max;
        }
    }
    return filterObj;
}

export function getPageData(page: number, limit: number, totalData: number) {
    const totalPages = Math.ceil(totalData / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    const pageData: IPageData = {
        totalPages,
        nextPage,
        prevPage
    }

    return pageData
}