const { exec } = require('child_process');
const path = require('path');

const repoPath = '/Users/kumamoto/NectarView';

// Gitログを取得してタイムスタンプを集計
function getGitLog() {
    return new Promise((resolve, reject) => {
        exec('git log --reverse --pretty=format:"%H,%at"', { cwd: repoPath }, (err, stdout) => {
            if (err) {
                return reject(err);
            }
            const log = stdout.split('\n').map(line => {
                const [commit, timestamp] = line.split(',');
                return { commit, timestamp: parseInt(timestamp, 10) };
            });
            resolve(log);
        });
    });
}

// コミット間の時間差を計算して、合計作業時間を推定
function calculateWorkingHours(log) {
    let totalHours = 0;
    for (let i = 1; i < log.length; i++) {
        const timeDiff = log[i].timestamp - log[i - 1].timestamp;
        const hoursDiff = timeDiff / 3600;
        if (hoursDiff > 0 && hoursDiff < 3) {  // 0時間以上3時間未満の差分を加算
            totalHours += hoursDiff;
        }
    }
    return totalHours;
}

async function estimateWorkTime() {
    try {
        const log = await getGitLog();
        const totalHours = calculateWorkingHours(log);
        return totalHours.toFixed(2);
    } catch (err) {
        console.error('Error reading git log:', err);
        throw err;
    }
}

module.exports = {
    estimateWorkTime
};
