const assemble = () => {
    const d = new Date()
    var day = d.getDate()
    var month = d.getMonth() + 1
    var year = d.getFullYear()
    
    full = `${month}/${day}/${year}`
    return full
}

module.exports = assemble