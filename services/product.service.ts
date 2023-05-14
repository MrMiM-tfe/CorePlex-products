import { ERole, IUser } from "@/core/types/user";
import {
    ESortingOptions,
    IFilter,
    IOpProduct,
    IPreProduct,
    IProduct,
    IProductResult,
    ProductResult,
} from "../types/product";
import User from "@/core/models/User";
import Product from "../models/Product";
import {
    checkIdentity,
    findProductByIdentity,
    generateFilterObj,
    handleModelErrors,
    getPageData,
} from "../helpers/general";
import { EProductMSG } from "../messages/product";
import { EResultTypes, EStatusCodes } from "@/core/types/general";

/**
 * function to get product by id and slug
 * @param identity slug string or product id string
 */
export const getProduct = async (identity: string) => {
    const product = await findProductByIdentity(identity);
    if (!product) {
        return ProductResult.singleError(
            "product",
            EProductMSG.PRODUCT_NOT_FOUND,
            EStatusCodes.NOT_FOUND
        );
    }

    return ProductResult.success(product, EProductMSG.SUCCESS);
};

// get paginated products
export const getProducts = async (
    page: number,
    limit: number,
    {
        sort = [ESortingOptions.NEWEST_FIRST],
        filter,
    }: { sort?: ESortingOptions[]; filter?: IFilter } = {}
) => {
    // generate number of products need to be skip base on page and limit
    const skip = (page - 1) * limit;

    // generate filter object for mongoose
    const filterObj = generateFilterObj(filter);

    try {
        // get products
        const products = await Product.find(filterObj)
            .sort(sort.join(" "))
            .skip(skip)
            .limit(limit);

        // get number of all products with filter
        const totalProducts = await Product.countDocuments(filterObj);

        // get page data
        const pageData = getPageData(page, limit, totalProducts);

        // create result
        const result : IProductResult = {
            status: 200,
            type: EResultTypes.SUCCESS,
            data: products as IProduct[],
            pageData
        }

        return result
    } catch (error) {
        return handleModelErrors(error);
    }
};

export const createProduct = async (data: IPreProduct, seller: IUser) => {
    // check if seller exist
    const user = await User.findById(seller._id);
    if (!user)
        return ProductResult.singleError("user", EProductMSG.USER_NOT_FOUND);

    // check if user has permission
    if (user.role !== ERole.SELLER && user.role !== ERole.ADMIN) {
        return ProductResult.singleError("role", EProductMSG.NO_PERMISSION);
    }

    // set product seller
    data.sellerId = user.id;

    try {
        // save product in database
        const newProduct = await Product.create(data);

        return ProductResult.success(newProduct);
    } catch (error) {
        return handleModelErrors(error);
    }
};

/**
 * function to edit product by id and slug
 * @param identity slug string or product id string
 */
export const editProduct = async (
    identity: string,
    data: IOpProduct,
    editor: string
) => {
    // check identity Type
    let identityType = checkIdentity(identity); // return "slug" or "id"

    // check if product exist
    const oldProduct = await findProductByIdentity(identity);
    if (!oldProduct) {
        return ProductResult.singleError(
            "product",
            EProductMSG.PRODUCT_NOT_FOUND,
            EStatusCodes.NOT_FOUND
        );
    }

    // get real editor from db and check it
    const editorUser = await User.findById(editor);
    if (!editorUser) {
        return ProductResult.singleError(
            "editor",
            EProductMSG.EDITOR_NOT_FOUND,
            EStatusCodes.NOT_FOUND
        );
    }

    // check if editor owned product
    if (
        oldProduct.sellerId !== editorUser._id.toString() &&
        editorUser.role !== ERole.ADMIN
    ) {
        return ProductResult.singleError(
            "editor",
            EProductMSG.NO_PERMISSION,
            EStatusCodes.FORBIDDEN
        );
    }

    // check if seller exist
    if (data.sellerId) {
        const user = await User.findById(data.sellerId);
        if (!user)
            return ProductResult.singleError(
                "user",
                EProductMSG.USER_NOT_FOUND
            );
    }

    // note: slug validation is by model it self

    // update options
    const options = {
        new: true, // to return new document not old one
    };

    try {
        if (identityType === "slug") {
            // save in db
            const product = await Product.findOneAndUpdate(
                { slug: identity },
                data,
                options
            );

            return ProductResult.success(
                product as IProduct,
                EProductMSG.SUCCESS_EDIT
            );
        } else {
            // save in db
            const product = await Product.findByIdAndUpdate(
                identity,
                data,
                options
            );

            return ProductResult.success(
                product as IProduct,
                EProductMSG.SUCCESS_EDIT
            );
        }
    } catch (error) {
        return handleModelErrors(error);
    }
};

/**
 * function to delete product by id and slug
 * @param identity slug string or product id string
 */
export const deleteProduct = async (identity: string, userId: string) => {
    // get and check product
    const product = await findProductByIdentity(identity);
    if (!product) {
        return ProductResult.singleError(
            "product",
            EProductMSG.PRODUCT_NOT_FOUND,
            EStatusCodes.NOT_FOUND
        );
    }

    // get and check if user exist
    const user = await User.findById(userId);
    if (!user) {
        return ProductResult.singleError(
            "user",
            EProductMSG.USER_NOT_FOUND,
            EStatusCodes.NOT_FOUND
        );
    }

    // check user permission
    if (product.sellerId !== user._id.toString() && user.role !== ERole.ADMIN) {
        return ProductResult.singleError(
            "user",
            EProductMSG.NO_PERMISSION,
            EStatusCodes.FORBIDDEN
        );
    }

    try {
        // delete product from db
        await product.deleteOne();

        return ProductResult.success(product, EProductMSG.SUCCESS_DELETE);
    } catch (error) {
        return handleModelErrors(error);
    }
};