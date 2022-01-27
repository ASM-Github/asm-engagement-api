function calculateScore(programs, role) {

    const programScore = programs.length;
    var activityScore = 0;
    //var roleScore = 0;
    var totalScore = 0;

    //score based on Role
    // if (role == "president") {
    //     roleScore = 10;
    // } else if (role == "councilmember") {
    //     roleScore = 5;
    // } else if (role == 'member') {
    //     roleScore = 3;
    // }

    programs.map(i => (
        i.activities.map(j => activityScore = activityScore + j.score)
    ));

    //calculate total score
    //totalScore = programScore + activityScore + roleScore;
    totalScore = programScore + activityScore;

    return totalScore;
}

function Top5ScoreSort(scores) {
    const newScores = scores.sort(function (a, b) {
        return b.score - a.score;
    });
    return newScores.slice(0, 5);
}

module.exports = { calculateScore, Top5ScoreSort }
