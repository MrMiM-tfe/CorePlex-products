import { Types } from "mongoose";
import { IProduct } from "./product";

export interface IPreProductCategory {
    name:string,
    slug?:string,
    mother?:string,
    des?:string
}

export interface IProductCategory extends IPreProductCategory {
    _id: Types.ObjectId,
    slug:string,
    products?: IProduct[]
}

export interface IOptProductCategory extends Partial<IProductCategory> {}