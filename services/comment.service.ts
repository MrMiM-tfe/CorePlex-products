import User from "@/core/models/User";
import { ECommentSortOptions, ECommentState, ICommentFilter, IOptProductComment, IPreProductComment } from "../types/productComment";
import { EStatusCodes, Result } from "@/core/types/general";
import { ECommentMSG } from "../messages/comment";
import { editPermission } from "@/core/helpers/auth";
import { handleModelErrors } from "../helpers/general";
import ProductComment from "../models/ProductComment";
import { ConvertToNaturalNumber, findDocByIdentity, getPageData } from "@/core/helpers/general";
import Product from "../models/Product";
import { IProduct } from "../types/product";
import { Document } from "mongoose";

export const getComment = async (id: string) => {
    // get comment
    const comment = await ProductComment.findById(id).populate("children")
    if (!comment) return Result.error("comment", ECommentMSG.COMMENT_NOT_FOUND, EStatusCodes.NOT_FOUND)

    return Result.success(comment, ECommentMSG.SUCCESS, EStatusCodes.SUCCESS)
}

export const getProductComments = async (productIdentity:string, page:number, limit:number) => {
    // validate page and limit
    page = ConvertToNaturalNumber(page);
    limit = ConvertToNaturalNumber(limit);

    // generate skip
    const skip = (page - 1) * limit;

    // get product and create filter obj
    const product = await findDocByIdentity(productIdentity, Product) as Document<unknown, {}, IProduct>
    if (!product) return Result.error("product", ECommentMSG.PRODUCT_NOT_FOUND, EStatusCodes.NOT_FOUND)
    const filter = {product: product._id?.toString() as string, state: ECommentState.ACCEPTED}

    try {
        // get comments
        const comments = await ProductComment.find(filter).populate("children").skip(skip).limit(limit)

        // get total number of comments base on filter
        const totalComments = await ProductComment.countDocuments(filter);

        // get page data
        const pageData = getPageData(page, limit, totalComments);

        return Result.success(comments, ECommentMSG.SUCCESS, EStatusCodes.SUCCESS, pageData);
    } catch (error) {
        return handleModelErrors(error);
    }
}

export const getComments = async (page: number, limit: number, { filter, sort }: { filter: ICommentFilter; sort: ECommentSortOptions } = { filter: {}, sort: ECommentSortOptions.NEWEST_FIRST }) => {
    // validate page and limit
    page = ConvertToNaturalNumber(page);
    limit = ConvertToNaturalNumber(limit);

    // generate skip
    const skip = (page - 1) * limit;

    try {
        // get comments
        const comments = await ProductComment.find(filter).skip(skip).limit(limit).sort(sort);

        // get total number of comments base on filter
        const totalComments = await ProductComment.countDocuments(filter);

        // get page data
        const pageData = getPageData(page, limit, totalComments);

        return Result.success(comments, ECommentMSG.SUCCESS, EStatusCodes.SUCCESS, pageData);
    } catch (error) {
        return handleModelErrors(error);
    }
};

// new comment by normal user
export const newComment = async (data: IPreProductComment, userId: string) => {
    // check user id
    const user = await User.findById(userId);
    if (!user) return Result.error("user", ECommentMSG.USER_NOT_FOUND, EStatusCodes.CONFLICT);

    // set user for creating comment
    data.user = user._id.toString();

    try {
        const comment = await ProductComment.create(data);

        return Result.success(comment, ECommentMSG.SUCCESS_CREATE, EStatusCodes.SUCCESS_CREATE);
    } catch (error) {
        return handleModelErrors(error);
    }
};

// new comment by admins and sellers from admin panel
export const createCommentByAdmins = async (data: IPreProductComment, userId: string) => {
    // check user id
    const user = await User.findById(userId);
    if (!user) return Result.error("user", ECommentMSG.USER_NOT_FOUND, EStatusCodes.CONFLICT);

    // check user permission
    if (!editPermission(user)) return Result.error("user", ECommentMSG.NO_PERMISSION, EStatusCodes.FORBIDDEN);

    // set user for creating comment
    data.user = user._id.toString();

    try {
        const comment = await ProductComment.create(data);

        return Result.success(comment, ECommentMSG.SUCCESS_CREATE, EStatusCodes.SUCCESS_CREATE);
    } catch (error) {
        return handleModelErrors(error);
    }
};

export const editComment = async (commentId: string, data: IOptProductComment, editorId: string) => {
    // check if user exist
    const user = await User.findById(editorId);
    if (!user) return Result.error("user", ECommentMSG.USER_NOT_FOUND, EStatusCodes.CONFLICT);

    // check user if user is not seller then set state to waiting
    if (!editPermission(user)) {
        // clear state
        data.state = ECommentState.WAITING;
    }

    try {
        const newComment = await ProductComment.findByIdAndUpdate(commentId, data, { new: true });

        // check if comment exist
        if (!newComment) return Result.error("commentId", ECommentMSG.COMMENT_NOT_FOUND, EStatusCodes.NOT_FOUND);

        return Result.success(newComment, ECommentMSG.SUCCESS_EDIT, EStatusCodes.SUCCESS);
    } catch (error) {
        return handleModelErrors(error);
    }
};

export const deleteComment = async (commentId: string, editorId: string) => {
    // check if user exist
    const user = await User.findById(editorId);
    if (!user) return Result.error("user", ECommentMSG.USER_NOT_FOUND, EStatusCodes.CONFLICT);

    const comment = await ProductComment.findById(commentId).populate("children");

    // check if comment exist
    if (!comment) return Result.error("commentId", ECommentMSG.COMMENT_NOT_FOUND, EStatusCodes.NOT_FOUND);

    // check editor permission
    if (user._id.toString() !== comment.user && !editPermission(user)) {
        Result.error("editor", ECommentMSG.NO_PERMISSION, EStatusCodes.FORBIDDEN);
    }

    try {
        // delete comment from db
        await comment.deleteOne();

        // change state of all comment children
        if (comment.children) {
            for (const child of comment.children) {
                await ProductComment.findByIdAndUpdate(child._id, {state: ECommentState.PARENT_DELETED})
            }
        }

        return Result.success(comment, ECommentMSG.SUCCESS_DELETE, EStatusCodes.SUCCESS);
    } catch (error) {
        return handleModelErrors(error);
    }
};
