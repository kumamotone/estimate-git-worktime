const { exec } = require('child_process');
const path = require('path');

const repoPath = '/Users/kumamoto/NectarView';

function getGitLog() {
    return new Promise((resolve, reject) => {
        exec('git log --reverse --pretty=format:"%H,%at,%s"', { cwd: repoPath }, (err, stdout) => {
            if (err) {
                return reject(err);
            }
            const log = stdout.split('\n').map(line => {
                const [commit, timestamp, message] = line.split(',');
                return { commit, timestamp: parseInt(timestamp, 10), message };
            });
            resolve(log);
        });
    });
}

function calculateWorkingHours(log) {
    let totalHours = 0;
    const detailedLog = [];
    for (let i = 1; i < log.length; i++) {
        const date = new Date(log[i].timestamp * 1000).toISOString().split('T')[0];
        const time = new Date(log[i].timestamp * 1000).toISOString().split('T')[1].substring(0, 5);
        const timeDiff = log[i].timestamp - log[i - 1].timestamp;
        const hoursDiff = timeDiff / 3600;
        
        detailedLog.push({
            date,
            time,
            message: log[i].message,
            hoursSinceLast: hoursDiff.toFixed(2),
            countedHours: hoursDiff > 0 && hoursDiff < 3 ? hoursDiff : 0
        });

        if (hoursDiff > 0 && hoursDiff < 3) {
            totalHours += hoursDiff;
        }
    }
    return { totalHours, detailedLog };
}

async function getWorkTimeData() {
    try {
        const log = await getGitLog();
        const { totalHours, detailedLog } = calculateWorkingHours(log);
        return { totalHours: totalHours.toFixed(2), detailedLog };
    } catch (err) {
        console.error('Error reading git log:', err);
        throw err;
    }
}

module.exports = {
    getWorkTimeData
};
