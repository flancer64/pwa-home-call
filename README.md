# Svyazist

**Svyazist** is a small self-hosted PWA for private video calls between family members.  
Pure JavaScript, WebRTC, no installs, no accounts.

**Live demo:** <https://call.wiredgeese.com/>

The product is developed together with the OpenAI Codex agent using the ADSM methodology  
(**Agent-Driven Software Methodology**, a context-driven programming approach).

The user interface and the full cognitive-context documentation are in Russian;  
see [AGENTS.md](./AGENTS.md) as the entry point.

---

## Installation Guide (English)

This guide describes how to deploy a self-hosted instance of **Svyazist** using:

- Linux server
- Apache
- HTTPS via Certbot
- Node.js backend (WebSocket signaling)
- Public STUN server (`stun.l.google.com:19302`)

TURN is not required in the minimal installation.  
Reference version: **0.1.0**.

---

## 1. Environment Preparation

### General requirements

- Linux server with SSH access
- Apache web server with HTTPS support
- Domain name pointing to the server
- Node.js **20+**
- Free local port for WebSocket signaling
- Directory for application files
- Ability to download the GitHub release
- Available STUN server (public STUN is sufficient)

### Configuration used in this guide

- Web server: **Apache**
- Domain: **call.example.com**
- HTTPS port: **443**
- WebSocket port: **4444**
- Installation path: `/home/user/app/svyazist`
- Application version: **0.1.0**
- STUN: `stun.l.google.com:19302`

---

## 2. Download and Place Application Files

Clone the stable release:

```bash
git clone --branch 0.1.0 https://github.com/flancer64/pwa-home-call /home/user/app/svyazist
```

Create environment file:

```bash
cp /home/user/app/svyazist/.env.example /home/user/app/svyazist/.env
```

Set WebSocket signaling port:

```text
WS_PORT=4444
```

Install backend dependencies:

```bash
cd /home/user/app/svyazist
npm ci
```

Start backend to verify installation:

```bash
npm start
```

Expected output:

```text
[INFO] Svyazist backend starting.
[INFO] [Signal] WebSocket signaling server started.
[INFO] Svyazist backend started.
```

Check that the signaling port is open:

```bash
ss -tlnp | grep 4444
```

You should see a listener on `0.0.0.0:4444`.

---

## 3. Configure Apache and HTTPS

Set document root and domain:

```apache
DocumentRoot /home/user/app/svyazist/web
ServerName call.example.com
```

Request TLS certificate:

```bash
sudo certbot --apache -d call.example.com
```

After successful configuration:

- `https://call.example.com/` should serve `index.html`
- Browser should show a valid HTTPS certificate
- `apachectl -S` must show a VirtualHost for `call.example.com:443`

---

## 4. Configure WebSocket Proxying in Apache

Local WebSocket signaling runs on port **4444**,
public endpoint must be:

```text
wss://call.example.com/signal
```

Add proxy routes:

```apache
ProxyPass        "/signal"  "ws://127.0.0.1:4444/signal"
ProxyPassReverse "/signal"  "ws://127.0.0.1:4444/signal"
```

Enable required modules:

```bash
sudo a2enmod proxy proxy_http proxy_wstunnel
sudo systemctl restart apache2
```

Checking modules:

```bash
apachectl -M | grep proxy
```

The WebSocket request should return **101 Switching Protocols**.

---

## 5. Validate WebRTC Operation

ICE configuration is located in `web/app/Rtc/Peer.mjs`:

Default configuration:

```js
iceServers: [{ urls: "stun:stun.l.google.com:19302" }];
```

TURN servers are not used in this setup.

### Final validation steps

- Open `https://call.example.com/` on two devices
- Confirm WebSocket signaling works correctly
- Check SDP and ICE candidate exchange (DevTools → Network → WS)
- Initiate a test call and confirm that a direct media connection is established

If no ICE candidates are received, clients may be behind restrictive NAT or blocked UDP traffic.
In this case, deploy your own STUN/TURN server (e.g., **coturn**) to ensure connectivity.

---

## License

Apache-2.0
