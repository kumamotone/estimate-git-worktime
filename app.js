const express = require('express');
const { estimateWorkTime } = require('./gitLogAnalyzer');
const app = express();
const port = 3000;

// 集計結果をフロントエンドに渡すルート
app.get('/', async (req, res) => {
    try {
        const totalHours = await estimateWorkTime();
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Git Work Time Estimator</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f9;
                        color: #333;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                    }

                    .container {
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }

                    h1 {
                        font-size: 24px;
                        margin-bottom: 10px;
                    }

                    p {
                        font-size: 18px;
                        margin: 5px 0;
                    }

                    .time-result {
                        font-size: 32px;
                        color: #007bff;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Git Work Time Estimator</h1>
                    <p>This tool estimates the total working time based on your Git commit history.</p>
                    <div class="time-result">Estimated working hours: ${totalHours} hours</div>
                </div>
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
