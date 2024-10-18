const express = require('express');
const { getWorkTimeData } = require('./gitLogAnalyzer');
const app = express();
const port = 3000;

// 集計結果をフロントエンドに渡すルート
app.get('/', async (req, res) => {
    try {
        const { totalHours, detailedLog } = await getWorkTimeData();
        
        // 累積作業時間を計算
        let cumulativeHours = 0;
        const cumulativeData = detailedLog.map(entry => {
            cumulativeHours += parseFloat(entry.countedHours);
            return {
                date: `${entry.date} ${entry.time}`,
                hours: cumulativeHours.toFixed(2)
            };
        });

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Git Work Time Estimator</title>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f9;
                        color: #333;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        margin-bottom: 20px;
                    }
                    h1, h2 {
                        margin-bottom: 10px;
                    }
                    .time-result {
                        font-size: 24px;
                        color: #007bff;
                        margin-top: 20px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    .chart-container {
                        height: 400px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Git Work Time Estimator</h1>
                    <div class="time-result">Estimated total working hours: ${totalHours} hours</div>
                </div>
                <div class="container">
                    <h2>Cumulative Work Time</h2>
                    <div class="chart-container">
                        <canvas id="workTimeChart"></canvas>
                    </div>
                </div>
                <div class="container">
                    <h2>Detailed Work Log</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Commit Message</th>
                                <th>Hours Since Last Commit</th>
                                <th>Counted Hours</th>
                                <th>Cumulative Hours</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${detailedLog.map((entry, index) => `
                                <tr>
                                    <td>${entry.date}</td>
                                    <td>${entry.time}</td>
                                    <td>${entry.message}</td>
                                    <td>${entry.hoursSinceLast}</td>
                                    <td>${entry.countedHours.toFixed(2)}</td>
                                    <td>${cumulativeData[index].hours}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <script>
                    const ctx = document.getElementById('workTimeChart').getContext('2d');
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: ${JSON.stringify(cumulativeData.map(entry => entry.date))},
                            datasets: [{
                                label: 'Cumulative Hours Worked',
                                data: ${JSON.stringify(cumulativeData.map(entry => entry.hours))},
                                fill: false,
                                borderColor: 'rgba(0, 123, 255, 1)',
                                tension: 0.1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Cumulative Hours'
                                    }
                                },
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Commit Date and Time'
                                    },
                                    ticks: {
                                        maxRotation: 45,
                                        minRotation: 45
                                    }
                                }
                            },
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            let label = context.dataset.label || '';
                                            if (label) {
                                                label += ': ';
                                            }
                                            if (context.parsed.y !== null) {
                                                label += context.parsed.y + ' hours';
                                            }
                                            return label;
                                        }
                                    }
                                }
                            }
                        }
                    });
                </script>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send('Error reading git log');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
