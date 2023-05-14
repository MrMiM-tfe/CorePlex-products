import slugify from "slugify";
import { EStatusCodes, IPageData, IResultError } from "@/core/types/general";
import { IFilter, IProduct, ProductResult } from "../types/product";
import Product from "../models/Product";
import { isValidObjectId } from "mongoose";

/**
 * @description middleware for mongoose schema to generate slug for any thing that has name and slug filed
 */
export function preSaveSlugGenerator(this: any, next: any) {
    const regexExp = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;

    // check if slug is modified by user
    if (this.slug && regexExp.test(this.slug)) {
        next();
    }

    this.slug = slugify(this.name);
    next();
}

export function handleModelErrors(error: any) {
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
                return await Product.findOne({ slug: identity });
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
      filterObj.$or = filter.brands.map((brand: string) => ({ brand }));
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

export function getPageData(page:number, limit:number, totalData: number) {
    const totalPages = Math.ceil(totalData / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    const pageData : IPageData = {
        totalPages,
        nextPage,
        prevPage
    }

    return pageData
}