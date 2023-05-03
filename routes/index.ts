import { Router } from "express";
const router = Router()


import { main } from "../controllers/main";

router.get("/", main)

export default router