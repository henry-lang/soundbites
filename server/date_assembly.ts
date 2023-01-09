export default function(): string {
    let d = new Date()
    let day = d.getDate()
    let month = d.getMonth() + 1
    let year = d.getFullYear()

    let full = `${month}/${day}/${year}`
    return full
}
