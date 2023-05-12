import { ECoreMSG } from "core/messages/general";

export enum EProductMSG {
    SUCCESS = "product found successfully",
    SUCCESS_CREATE = "product created successfully",
    SUCCESS_EDIT = "product edited successfully",
    SUCCESS_DELETE = "product deleted successfully",
    CAN_CREATE_PRODUCT = "can not create product",
    USER_NOT_FOUND = "user not found",
    PRODUCT_NOT_FOUND = "product not found",
    EDITOR_NOT_FOUND = "editor not found",
    NO_PERMISSION = " no permission",

};

export type ProductMSG = EProductMSG | ECoreMSG