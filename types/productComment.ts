
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
}

export interface IPreProductComment {
    title:string,
    body:string,
    product:string,
    user?:string,
    parent?:string,
}

export interface IProductComment extends IPreProductComment{
    state: ECommentState
}

export interface IOptProductComment extends Partial<Omit<IProductComment, "product" | "user">> {}