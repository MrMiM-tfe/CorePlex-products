import {Request, Response} from "express";
import {
    createProduct,
    deleteProduct,
    editProduct,
    getProduct,
    getProducts,
} from "../services/product.service";
import {
    ESortingOptions,
    IFilter,
    IOpProduct,
    IPreProduct,
    ProductResponse,
} from "../types/product";
import {IUser} from "@/core/types/user";

export const index = async (req: Request, res: Response) => {
    const page = Number(req.query.page) ?? 1;
    const limit = Number(req.query.limit) ?? 10;

    const sortStringList = req.body.sort?.split(",");
    const filter = req.body.filter as IFilter;

    // validate sort
    let sort = undefined;
    if (sortStringList) {
        sort = [];
        sortStringList.map((sortString: string) => {
            sort.push(
                ESortingOptions[sortString as keyof typeof ESortingOptions]
            );
        });
    }

    const result = await getProducts(page, limit, {sort, filter});

    return ProductResponse(res, result);
};

export const create = async (req: Request, res: Response) => {
    const data = req.body as IPreProduct;

    const result = await createProduct(data, req.user as IUser);

    return ProductResponse(res, result);
};

export const edit = async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const data = req.body as IOpProduct;
    const userId = req.user?._id.toString() as string;

    const result = await editProduct(slug, data, userId);

    return ProductResponse(res, result);
};

export const del = async (req: Request, res: Response) => {

    const slug = req.params.slug
    const userId = req.user?._id.toString() as string

    const result = await deleteProduct(slug, userId)

    return ProductResponse(res, result);
}

export const singleProduct = async (req: Request, res: Response) => {

    const slug = req.params.slug

    const result = await getProduct(slug)

    return ProductResponse(res, result);
}