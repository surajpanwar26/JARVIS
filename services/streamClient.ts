import { AgentEvent } from "../types";
import { getApiBaseUrl } from "./config";

export class StreamClient {
  private ws: WebSocket | null = null;
  private url: string;
  private onMessage: (event: AgentEvent) => void;

  constructor(onMessage: (event: AgentEvent) => void) {
    this.onMessage = onMessage;
    // Convert HTTP URL to WebSocket URL
    const baseUrl = getApiBaseUrl();
    if (baseUrl.startsWith('https://')) {
      this.url = baseUrl.replace('https://', 'wss://') + '/ws/research';
    } else if (baseUrl.startsWith('http://')) {
      this.url = baseUrl.replace('http://', 'ws://') + '/ws/research';
    } else {
      // Fallback for cases where baseUrl doesn't include protocol
      this.url = `ws://${baseUrl}/ws/research`;
    }
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("Connected to JARVIS Neural Link (WebSocket)");
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Map backend events to frontend AgentEvent type
        const agentEvent: AgentEvent = {
          type: data.type || 'info',
          message: data.message || JSON.stringify(data.data),
          agentName: data.agent,
          data: data.data,
          timestamp: new Date()
        };
        
        this.onMessage(agentEvent);
      } catch (e) {
        console.error("WS Parse Error", e);
      }
    };

    this.ws.onclose = () => console.log("JARVIS Neural Link Severed");
  }

  startResearch(topic: string, isDeep: boolean) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ topic, is_deep: isDeep }));
    } else {
      console.error("WebSocket not ready");
    }
  }

  disconnect() {
    if (this.ws) this.ws.close();
  }
}
