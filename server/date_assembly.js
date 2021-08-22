const assemble = () => {
    let d = new Date()
    let day = d.getDate()
    let month = d.getMonth() + 1
    let year = d.getFullYear()

    full = `${month}/${day}/${year}`
    return full
}

export default assemble
