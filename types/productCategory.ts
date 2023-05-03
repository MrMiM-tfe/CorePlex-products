export interface IPreProductCategory {
    name:string,
    slug?:string,
    mother?:string,
    des?:string
}

export interface IProductCategory extends IPreProductCategory {
    slug:string
}