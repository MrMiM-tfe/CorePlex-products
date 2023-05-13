import { Router } from "express";
const router = Router()


import * as main from "../controllers/main";
import { sellerCheck } from "core/middlewares/auth";

router.get("/", main.index)
router.get("/:id", main.singleProduct)

// protect routes
router.use(sellerCheck)
router.post("/", main.create)
router.put("/:slug", main.edit)
router.delete("/:slug", main.del)

export default router