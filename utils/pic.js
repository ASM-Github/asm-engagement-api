function remapPIC(data) {
    const newData = data.map(item => {
        return {
            value: item._id,
            label: item.email
        }
    })
    return newData
}

module.exports = { remapPIC }
