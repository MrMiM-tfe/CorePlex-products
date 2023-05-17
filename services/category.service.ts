import { EStatusCodes, Result } from "@/core/types/general";
import ProductCategory from "../models/ProductCategory";
import { IPreProductCategory } from "../types/productCategory";
import { ECategoryMSG } from "../messages/category";
import User from "@/core/models/User";
import { ERole } from "@/core/types/user";
import { handleModelErrors } from "../helpers/general";


export const createCategory = async (data: IPreProductCategory, creatorId: string) => {

    // check if creator exist
    const user = await User.findById(creatorId)
    if (!user) {
        return Result.error("user", ECategoryMSG.USER_NOT_FOUND, EStatusCodes.CONFLICT)
    }

    // check creator permission
    if (user.role !== ERole.SELLER && user.role !== ERole.ADMIN) {
        return Result.error("user", ECategoryMSG.NO_PERMISSION, EStatusCodes.FORBIDDEN)        
    }

    try {
        const category = await ProductCategory.create(data)

        return Result.success(category, ECategoryMSG.SUCCESS_CREATE, EStatusCodes.SUCCESS_CREATE)
    } catch (error) {
        return handleModelErrors(error)
    }
}