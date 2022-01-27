function renameArrayKey(data) {
    const newData = data.map(item => {
        return {
            value: item._id,
            label: item.activity_type
        }
    })
    return newData;
}

function NewProgramOptions(data) {
    const newData = data.map(i => {
        return {
            value: i._id,
            label: i.topic
        }
    })
    return newData;
}

function Program4Select(data) {
    const program = data.map(p => {
        return {
            value: p._id,
            label: p.topic
        }
    })
    return program;
}

function remapParticipants(fellows) {

    const participant = fellows.map(fellow => {
        return {
            value: fellow._id,
            label: fellow.name
        }
    })

    return participant;
}


module.exports = { renameArrayKey, NewProgramOptions, Program4Select, remapParticipants }
