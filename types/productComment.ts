import { Types } from "mongoose"

export interface ICommentFilter {
    user?:string,
    state?:string,
    product?:string
}

export enum ECommentSortOptions {
    NEWEST_FIRST = '-createdAt',
    OLDEST_FIRST = 'createdAt',
}

export enum ECommentState {
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    WAITING = "waiting",
    PARENT_DELETED = "parent_deleted",
}

export interface IPreProductComment {
    title:string,
    body:string,
    product:string,
    user?:string,
    parent?:string,
}

export interface IProductComment extends IPreProductComment{
    _id: Types.ObjectId
    state: ECommentState,
    children?: IProductComment[]
}

export interface IOptProductComment extends Partial<Omit<IProductComment, "product" | "user">> {}