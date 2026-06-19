import WebSocket from "ws";
import os, { freemem } from 'os';

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function getLoginHistory() {
    const { stdout } = await execAsync('last -wa | head -30')

    const lines = stdout.trim().split('\n')
        .filter(line =>
            line.trim() !== '' &&
            !line.startsWith('wtmp') &&
            !line.startsWith('reboot')
        )

    return lines.map(line => {
        const parts = line.trim().split(/\s+/)
        // farhan-k  tty2  Thu Jun 18 12:22  still logged in  tty2
        return {
            user: parts[0],
            terminal: parts[1],
            loginTime: `${parts[2]} ${parts[3]} ${parts[4]} ${parts[5]}`,  // Thu Jun 18 12:22
            logoutTime: parts[6] === 'still' ? 'still logged in' : parts[6],
            sourceIp: parts[parts.length - 1],  // last column
        }
    })
}

const SERVER_URL = 'ws://localhost:9000';

const ws = new WebSocket(SERVER_URL);


function cpuAverage() {
    const cpus = os.cpus();

    let idle = 0;
    let total = 0;

    cpus.forEach(core => {

        for (let type in core.times) {
            total += core.times[type];
        }

        idle += core.times.idle;

    });
    console.log({ idle, total })
    return { idle, total };
}

async function getCPUUsage() {
    const start = cpuAverage();
    await new Promise(res => setTimeout(res, 100));
    const end = cpuAverage();

    const idleDiff = end.idle - start.idle;
    const totalDiff = end.total - start.total;

    let final = 100 - Math.floor((100 * idleDiff) / totalDiff);

    console.log(final);
    return final;


}

async function getCPUVitals() {

    // const
    // totalMem =  (os.totalmem() / (1024**3).toFixed(2)), 
    const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2)
    const freeMem = (os.freemem() / (1024 ** 3).toFixed(2))
    const usedMem = ((totalMem - freeMem)).toFixed(2)
    
    // const upTime = (os.uptime() / (60 * 60)).toFixed(2) // old code
    const uptimeSecs = os.uptime()
    const hrs = Math.floor(uptimeSecs / 3600)
    const mins = Math.floor((uptimeSecs % 3600) / 60)
    const upTime = `${hrs}h ${mins}m`

    const osType = os.type();

    let cpuUsage = await getCPUUsage();
    const loginHistory = await getLoginHistory();

    return {
        type: "agent",
        machineId: os.hostname(),
        osType,
        upTime,
        cpuUsage,
        totalMemory: totalMem,
        usedMemory: usedMem,
        memoryUsagePercentage: ((usedMem / totalMem) * 100).toFixed(2),
        timestamp: new Date().toLocaleString(),
        loginHistory
    }


    // console.log(totalMem, freeMem, usedMem, upTime, osType);
}




ws.on("open", () => {
    console.log('Connected to Server!');

    const registerData = {
        type: "register",
        machineId: os.hostname()
    }

    ws.send(JSON.stringify(registerData));

    setInterval(async () => {
        const vitals = await getCPUVitals();
        ws.send(JSON.stringify(vitals));
        console.log('Sent:', vitals);
    }, 1000);

});

ws.on("close", () => {
    console.log("disconnected from server");
});

ws.on("error", (err) => {
    console.error("Error: ", err.message);
})