import { IUser } from "core/types/user";

export enum EProductTypes {
    SINGLE = "single",
    MOTHER = "mother",
    CHILDREN = "children"
}

export interface IRegisteringProduct {
    name:string,
    slug?:string,
    type?:EProductTypes,
    mother?: string,
    coverImage?:string,
    images?:string[],
    shortDes?:string,
    des?:string,
    categories?: string[],
    price?:number,
    specialPrice?:number,
    quantity?:number,
    isOutOfStock?:boolean,
}

export interface IProduct extends IRegisteringProduct {
    slug:string,
    type:EProductTypes,
    sellerId:string,
    seller: IUser,
    sold:number,
    ratingsAverage: number,
    ratingsQuantity: number
}