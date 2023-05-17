import {EResultTypes, EStatusCodes, IPageData, IResultError} from "@/core/types/general";
import {IUser} from "@/core/types/user";
import {EProductMSG, ProductMSG} from "../messages/product";
import {Response} from "express";

// product types -----------------------------------------------
export enum EProductTypes {
    SINGLE = "single",
    MOTHER = "mother",
    CHILDREN = "children",
}

export enum ESortingOptions {
    PRICE_HIGH_TO_LOW = '-price',
    PRICE_LOW_TO_HIGH = 'price',
    NEWEST_FIRST = '-createdAt',
    OLDEST_FIRST = 'createdAt',
    BEST_SELLING = '-sold',
    RATINGS_HIGH_TO_LOW = '-ratingsAverage',
    RATINGS_LOW_TO_HIGH = 'ratingsAverage',
    // BRAND_A_TO_Z = 'brand',
    // BRAND_Z_TO_A = '-brand',
    NAME_A_TO_Z = 'name',
    NAME_Z_TO_A = '-name',
}

export interface IFilter {
    price?: {
        min?: number;
        max?: number;
    };
    brands?: string[];
}

export interface IPreProduct {
    name: string;
    slug?: string;
    sellerId?: string;
    type?: EProductTypes;
    mother?: string;
    coverImage?: string;
    images?: string[];
    shortDes?: string;
    des?: string;
    categories?: string[];
    price?: number;
    specialPrice?: number;
    quantity?: number;
    isOutOfStock?: boolean;
}


export interface IProduct extends IPreProduct {
    slug: string;
    type: EProductTypes;
    sellerId: string;
    seller: IUser;
    sold: number;
    ratingsAverage: number;
    ratingsQuantity: number;
}

export interface IOpProduct extends Partial<Omit<IProduct, "seller">> {
}

// product result types ------------------------------------------------------
export interface IProductResult {
    type: EResultTypes;
    status: number;
    message?: ProductMSG;
    errors?: IResultError[];
    data?: IProduct | IProduct[];
    pageData?: IPageData
}

const successProductResult = (data: IProduct, message: EProductMSG = EProductMSG.SUCCESS_CREATE) => {
    const res: IProductResult = {
        type: EResultTypes.SUCCESS,
        message,
        status: 201,
        data,
    };

    return res;
};


// generate error
const errorProductResult = (
    errs: IResultError[] | IResultError,
    status: EStatusCodes
) => {
    const errors = Array.isArray(errs) ? errs : [errs];

    const res: IProductResult = {
        type: EResultTypes.ERROR,
        errors,
        status,
    };

    return res;
};

// generate single error
const singleErrorProductResult = (
    name: string,
    message: EProductMSG,
    status: EStatusCodes = EStatusCodes.BAD_REQUEST
) => {
    // generate result error
    const error: IResultError = {
        name,
        message,
        status
    }

    // generate error
    const res: IProductResult = {
        type: EResultTypes.ERROR,
        status: error.status,
        errors: [error],
    }

    return res
};

export const ProductResult = {
    success: successProductResult,
    error: errorProductResult,
    singleError: singleErrorProductResult
};


// product response types ------------------------------------------------------
export interface IProductResponse extends IProductResult {
}

export const ProductResponse = (res: Response, result: IProductResult) => {
    const resp: IProductResponse = result as IProductResponse

    return res.status(resp.status).json(resp)
}
