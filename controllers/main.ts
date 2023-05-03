import { Request, Response } from "express"

export const main = (req: Request, res: Response) => {
    res.json({msg:"hello to pro"})
}