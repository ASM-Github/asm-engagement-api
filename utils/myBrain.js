function remapBatchActivity(fellow_desc, program_id, data) {

    const activity = data.map(act => {
        const { id } = act;
        return {
            fellow_desc,
            program_id,
            activity_id: id

        }
    })
    return activity;
}

module.exports = { remapBatchActivity };