import express from 'express'
import http from 'http'
import cors from 'cors'
import { WebSocketServer } from 'ws'
import sendEmail from './sendEmail.js'

const app = express()
app.use(cors())

const server = http.createServer(app)

const wss = new WebSocketServer({ server })

let dashboards = new Set();

const THRESHOLD = 60
const STRIKES_NEEDED = 3
const COOLDOWN_MS = 5 * 60 * 1000 // 5 min

const alertState = {}
// becomes: { "my-machine": { cpuStrikes: 0, memStrikes: 0, lastAlertTime: 0 } }

async function sendAlert(machineId, type, value, loginHistory) {
    await sendEmail({ machineId, type, value, threshold: THRESHOLD, loginHistory })
}

function checkAlerts(data) {
    const { machineId, cpuUsage, memoryUsagePercentage, loginHistory } = data

    if (!alertState[machineId]) {
        alertState[machineId] = {
            cpuStrikes: 0,
            memStrikes: 0,
            lastAlertTime: 0,
        }
    }

    const state = alertState[machineId]
    const now = Date.now()
    const cooledDown = now - state.lastAlertTime > COOLDOWN_MS
    // cooledDown = "has it been 5 minutes since last email?"
    // Yes → allow email
    // No → block email

    // CPU
    if (cpuUsage > THRESHOLD) {
        state.cpuStrikes++
    } else {
        state.cpuStrikes = 0
    }

    if (state.cpuStrikes >= STRIKES_NEEDED && cooledDown) {
        sendAlert(machineId, 'CPU Usage', cpuUsage)
        state.lastAlertTime = now // now --> current timestamp
        state.cpuStrikes = 0
    }

    // Memory
    if (memoryUsagePercentage > THRESHOLD) {
        state.memStrikes++
    } else {
        state.memStrikes = 0
    }

    if (state.memStrikes >= STRIKES_NEEDED && cooledDown) {
        sendAlert(machineId, 'Memory Usage', memoryUsagePercentage, loginHistory)
        state.lastAlertTime = now
        state.memStrikes = 0
    }
}

wss.on("connection", (ws) => {
    console.log('New client connected!')

    ws.on("message", (message) => {
        const data = JSON.parse(message.toString());

        if (data.type === 'dashboard') {
            dashboards.add(ws);
            console.log("Dashboard connected !!!!!!!");
            console.log(dashboards)
            console.log(data);
            return;
        }

        if (data.type === 'agent') {
            console.log('Agent data received');

            checkAlerts(data)
            
            dashboards.forEach((client) => {
                if (client.readyState === 1) {
                    client.send(JSON.stringify(data));
                }
            })
        }
        console.log(data);
    })

    ws.on("close", () => {
        console.log('client disconnected!');
    });
});

app.get('/', (req, res) => {
    res.send('Watchdog Server is running!');
});

server.listen(9000, () => {
    console.log('Server running on http://localhost:3000');
})