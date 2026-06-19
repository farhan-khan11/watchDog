// import { Resend } from "resend";
// import dotenv from 'dotenv'
// dotenv.config()

// const resend = new Resend(process.env.RESEND_API_KEY)

// async function sendEmail({ machineId, type, value, threshold }) {
//   const { data, error } = await resend.emails.send({
//     from: "farhan@farhankhan.in",
//     to: "farhankhan94416@gmail.com",
//     subject: `🚨 Watchdog Alert — ${type} High on ${machineId}`,
//     html: `
//       <p><b>Machine</b>: ${machineId}</p>
//       <p><b>Alert</b>: ${type} exceeded ${threshold}% three times in a row</p>
//       <p><b>Current</b>: ${value}%</p>
//       <p><b>Time</b>: ${new Date().toLocaleString()}</p>
//       <p>Take action immediately.</p>
//     `,
//   });

//   if (error) {
//     console.error("Email error:", error);
//     return;
//   }

//   console.log("Email sent:", data);
// }

// export default sendEmail;

import { Resend } from "resend"
import dotenv from 'dotenv'
dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendEmail({ machineId, type, value, threshold, loginHistory }) {

    const loginRows = loginHistory?.map(entry => `
        <tr>
            <td style="padding:6px">${entry.user}</td>
            <td style="padding:6px">${entry.terminal}</td>
            <td style="padding:6px">${entry.loginTime}</td>
            <td style="padding:6px">${entry.logoutTime}</td>
            <td style="padding:6px; color:${!entry.sourceIp?.startsWith('tty') && entry.sourceIp !== 'login screen' ? 'red' : 'black'}">
                ${entry.sourceIp}
            </td>
        </tr>
    `).join('') || '<tr><td colspan="5">No login data</td></tr>'

    const { data, error } = await resend.emails.send({
        from: "farhan@farhankhan.in",
        to: "farhankhan94416@gmail.com",
        subject: `🚨 Watchdog Alert — ${type} High on ${machineId}`,
        html: `
            <h2>🚨 Watchdog Alert</h2>
            <p><b>Machine</b>: ${machineId}</p>
            <p><b>Alert</b>: ${type} exceeded ${threshold}% three times in a row</p>
            <p><b>Current</b>: ${value}%</p>
            <p><b>Time</b>: ${new Date().toLocaleString()}</p>

            <h3>Login History</h3>
            <table border="1" cellpadding="0" cellspacing="0" style="border-collapse:collapse; width:100%">
                <thead style="background:#f0f0f0">
                    <tr>
                        <th style="padding:6px">User</th>
                        <th style="padding:6px">Terminal</th>
                        <th style="padding:6px">Login Time</th>
                        <th style="padding:6px">Logout Time</th>
                        <th style="padding:6px">Source IP / Host</th>
                    </tr>
                </thead>
                <tbody>
                    ${loginRows}
                </tbody>
            </table>

            <br/>
            <p style="color:red"><b>Take action immediately.</b></p>
        `,
    })

    if (error) {
        console.error("Email error:", error)
        return
    }
    console.log("Email sent:", data)
}

export default sendEmail