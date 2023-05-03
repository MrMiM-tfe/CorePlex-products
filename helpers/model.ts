import slugify from "slugify";
export function preSaveSlugGenerator(this:any, next:any) {
    const regexExp = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/

    // check if slug is modified by user
    if(this.slug && regexExp.test(this.slug)){
        next()
    }

    this.slug = slugify(this.name)
    next()
}