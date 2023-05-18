import {EResultTypes, EStatusCodes, IResultType, Result} from "@/core/types/general";
import ProductCategory from "../models/ProductCategory";
import {
    IOptProductCategory,
    IPreProductCategory,
    IProductCategory,
} from "../types/productCategory";
import {ECategoryMSG} from "../messages/category";
import User from "@/core/models/User";
import {ERole} from "@/core/types/user";
import {handleModelErrors} from "../helpers/general";
import {editPermission} from "@/core/helpers/auth";
import {findDocByIdentity, getPageData} from "@/core/helpers/general";
import {Document, Model} from "mongoose";

export const getCategory = async (identity: string) => {
    // get and check category
    const category = await findDocByIdentity(identity, ProductCategory, "products") as Document<unknown, {}, IProductCategory>
    if (!category) return Result.error("category", ECategoryMSG.CATEGORY_NOT_FOUND, EStatusCodes.NOT_FOUND)

    return Result.success(category, ECategoryMSG.SUCCESS, EStatusCodes.SUCCESS)
}

export const getCategories = async (
    page: number = 1,
    limit: number = 10,
    motherIdentity?: string
) => {
    // generate number of products need to be skip base on page and limit
    const skip = (page - 1) * limit;

    // generate filter object (filter by mother of category)
    const filterObj: any = {}
    if (motherIdentity) {

        const motherCat = await findDocByIdentity(motherIdentity, ProductCategory) as Document<unknown, {}, IProductCategory>
        if (motherCat) {
            filterObj["mother"] = motherCat._id?.toString()
        }
    }

    try {
        // get categories
        const categories = await ProductCategory.find(filterObj)
            .skip(skip)
            .limit(limit).populate("products")


        // get total number of categories
        const totalCategories = await ProductCategory.countDocuments(filterObj)

        // get page data
        const pageData = getPageData(page, limit, totalCategories)

        // create result
        const res: IResultType = {
            type: EResultTypes.SUCCESS,
            status: EStatusCodes.SUCCESS,
            data: categories,
            pageData,
        }

        return res
    } catch (error) {
        return handleModelErrors(error)
    }
};

export const createCategory = async (
    data: IPreProductCategory,
    creatorId: string
) => {
    // check if creator exist
    const user = await User.findById(creatorId);
    if (!user) {
        return Result.error(
            "user",
            ECategoryMSG.USER_NOT_FOUND,
            EStatusCodes.CONFLICT
        );
    }

    // check creator permission
    if (user.role !== ERole.SELLER && user.role !== ERole.ADMIN) {
        return Result.error(
            "user",
            ECategoryMSG.NO_PERMISSION,
            EStatusCodes.FORBIDDEN
        );
    }

    try {
        const category = await ProductCategory.create(data);

        return Result.success(
            category,
            ECategoryMSG.SUCCESS_CREATE,
            EStatusCodes.SUCCESS_CREATE
        );
    } catch (error) {
        return handleModelErrors(error);
    }
};

export const editCategory = async (
    identity: string,
    data: IOptProductCategory,
    editorId: string
) => {
    // check if user exist
    const user = await User.findById(editorId);
    if (!user)
        return Result.error(
            "user",
            ECategoryMSG.EDITOR_NOT_FOUND,
            EStatusCodes.CONFLICT
        );

    // check editor permission
    if (!editPermission(user))
        return Result.error(
            "user",
            ECategoryMSG.NO_PERMISSION,
            EStatusCodes.FORBIDDEN
        );

    // get Category by identity and check it
    const category = (await findDocByIdentity(
        identity,
        ProductCategory
    )) as Model<IProductCategory>;
    if (!category)
        return Result.error(
            "category",
            ECategoryMSG.CATEGORY_NOT_FOUND,
            EStatusCodes.NOT_FOUND
        );

    try {
        // update category
        const newCategory = await category.updateOne(data, {new: true});
        return Result.success(
            newCategory,
            ECategoryMSG.SUCCESS_EDIT,
            EStatusCodes.SUCCESS
        );
    } catch (error) {
        return handleModelErrors(error);
    }
};

export const deleteCategory = async (identity: string, editorId: string) => {
    // check if user exist
    const user = await User.findById(editorId);
    if (!user)
        return Result.error(
            "user",
            ECategoryMSG.EDITOR_NOT_FOUND,
            EStatusCodes.CONFLICT
        );

    // check editor permission
    if (!editPermission(user))
        return Result.error(
            "user",
            ECategoryMSG.NO_PERMISSION,
            EStatusCodes.FORBIDDEN
        );

    // get Category by identity and check it
    const category = (await findDocByIdentity(
        identity,
        ProductCategory
    )) as Model<IProductCategory>;
    if (!category)
        return Result.error(
            "category",
            ECategoryMSG.CATEGORY_NOT_FOUND,
            EStatusCodes.NOT_FOUND
        );

    try {
        // delete category
        const deletedCategory = await category.deleteOne();
        return Result.success(
            deletedCategory,
            ECategoryMSG.SUCCESS_DELETE,
            EStatusCodes.SUCCESS
        );
    } catch (error) {
        return handleModelErrors(error);
    }
};
