import { useEffect, useState } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:9000'

export default function useMetrics(){
    const [metrics, setMetrics] = useState(null);

    useEffect(()=>{
        // dev
        // const ws = new WebSocket('ws://localhost:9000');

        //prod
        // const ws = new WebSocket('ws://watchdog.farhankhan.in/ws')
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log("Dashboard Connected !");
            ws.send(JSON.stringify({type: "dashboard"}));
        };

        // What we receive from the server
        ws.onmessage= (event) => {
            const data = JSON.parse(event.data);

            if(data.type === "agent"){
                console.log(data);
                setMetrics(data);
            }
        }

        ws.onclose = ()  => console.log("WS Closed !");

        return () => ws.close();
    }, []);

    return metrics;
}