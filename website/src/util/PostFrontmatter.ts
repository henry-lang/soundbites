export default interface PostFrontmatter {
    title: string
    description: string
    tags: string[]
    date: string // See if I can make this an actual date object, right now I have to convert it
}
