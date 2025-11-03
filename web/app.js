import { SignalClient } from './ws/client.js';
import { PeerConnection } from './rtc/peer.js';

const STATES = ['enter', 'lobby', 'call', 'end'];
const TEMPLATE_PATHS = {
  enter: 'ui/enter.html',
  lobby: 'ui/lobby.html',
  call: 'ui/call.html',
  end: 'ui/end.html'
};

let appRoot = null;
let templates = {};
let currentState = null;
let currentVersion = null;
let signal = null;
let peer = null;
let localStream = null;
let remoteStream = null;
let userName = '';
let roomCode = '';
let onlineUsers = [];
let connectionMessage = '';

async function init() {
  appRoot = document.getElementById('app');
  await Promise.all([registerServiceWorker(), loadTemplates(), prepareMedia()]);
  setupSignalClient();
  render('enter');
}

document.addEventListener('DOMContentLoaded', init);

async function loadTemplates() {
  const entries = await Promise.all(
    STATES.map(async (state) => {
      const response = await fetch(TEMPLATE_PATHS[state]);
      const html = await response.text();
      return [state, html];
    })
  );
  templates = Object.fromEntries(entries);
}

async function prepareMedia() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      connectionMessage = 'Media devices are not supported in this browser.';
      return;
    }
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  } catch (error) {
    console.error('[App] Media permissions denied', error);
    connectionMessage = 'Camera or microphone permissions are required.';
  }
}

function setupSignalClient() {
  const scheme = location.protocol === 'https:' ? 'wss://' : 'ws://';
  const host = location.host || 'localhost';
  signal = new SignalClient(`${scheme}${host}/ws/`);

  peer = new PeerConnection({
    sendOffer: (to, sdp) => signal.sendOffer(to, sdp),
    sendAnswer: (to, sdp) => signal.sendAnswer(to, sdp),
    sendCandidate: (to, candidate) => signal.sendCandidate(to, candidate),
    onRemoteStream: (stream) => {
      remoteStream = stream;
      attachRemoteStream();
    },
    onStateChange: (state) => {
      if (state === 'disconnected' || state === 'failed') {
        endCall('Connection lost.');
      }
    }
  });
  if (localStream) {
    peer.setLocalStream(localStream);
  }

  signal.on('online', (users) => {
    onlineUsers = users.filter((user) => user !== userName);
    if (currentState === 'lobby') {
      render('lobby');
    }
  });

  signal.on('offer', async (data) => {
    if (currentState !== 'call') {
      render('call');
    }
    try {
      if (!localStream) {
        throw new Error('Local media unavailable');
      }
      await peer.handleOffer(data);
      attachLocalStream();
    } catch (error) {
      console.error('[App] Failed to handle offer', error);
      endCall('Unable to accept call.');
    }
  });

  signal.on('answer', async (data) => {
    try {
      await peer.handleAnswer(data);
    } catch (error) {
      console.error('[App] Failed to handle answer', error);
    }
  });

  signal.on('candidate', async (data) => {
    try {
      await peer.addCandidate(data);
    } catch (error) {
      console.error('[App] Failed to add candidate', error);
    }
  });

  signal.on('error', (data) => {
    console.error('[App] Signal error', data);
    connectionMessage = data.message || 'Signal error occurred.';
    if (currentState === 'enter') {
      render('enter');
    }
  });

  signal.on('status', ({ state }) => {
    if (state === 'closed' && currentState !== 'enter') {
      peer.end();
      remoteStream = null;
      connectionMessage = 'Connection to the signaling server lost.';
      render('enter');
    }
  });
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register('service-worker.js');
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
    await checkVersion(registration);
    setInterval(() => checkVersion(registration), 60 * 1000);
  } catch (error) {
    console.warn('[App] Service worker registration failed', error);
  }
}

async function checkVersion(registration) {
  try {
    const response = await fetch('version.json', { cache: 'no-store' });
    const data = await response.json();
    if (currentVersion && currentVersion !== data.version) {
      if (registration.waiting) {
        registration.waiting.postMessage('skip-waiting');
      }
    }
    currentVersion = data.version;
  } catch (error) {
    console.warn('[App] Unable to check version', error);
  }
}

function render(state) {
  if (!templates[state]) {
    return;
  }
  currentState = state;
  appRoot.innerHTML = templates[state];
  switch (state) {
    case 'enter':
      bindEnter();
      break;
    case 'lobby':
      bindLobby();
      break;
    case 'call':
      bindCall();
      break;
    case 'end':
      bindEnd();
      break;
    default:
      break;
  }
}

function bindEnter() {
  const form = document.getElementById('enter-form');
  const errorBox = document.getElementById('enter-error');
  if (connectionMessage) {
    errorBox.textContent = connectionMessage;
    connectionMessage = '';
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    userName = (formData.get('user') || '').toString().trim();
    roomCode = (formData.get('room') || '').toString().trim();
    if (!userName || !roomCode) {
      errorBox.textContent = 'Both fields are required.';
      return;
    }
    try {
      await signal.connect();
      signal.join(roomCode, userName);
      render('lobby');
    } catch (error) {
      console.error('[App] Failed to connect to signaling server', error);
      errorBox.textContent = 'Unable to connect. Please try again later.';
    }
  });
}

function bindLobby() {
  const roomLabel = document.getElementById('lobby-room');
  const list = document.getElementById('user-list');
  const leaveButton = document.getElementById('leave-room');
  roomLabel.textContent = `Room: ${roomCode}`;
  list.innerHTML = '';
  if (onlineUsers.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'Waiting for other participants...';
    list.appendChild(empty);
  } else {
    onlineUsers.forEach((user) => {
      const card = document.createElement('div');
      card.className = 'user-card';
      card.setAttribute('role', 'listitem');
      const span = document.createElement('span');
      span.textContent = user;
      const button = document.createElement('button');
      button.className = 'primary';
      button.textContent = 'Call';
      button.addEventListener('click', () => startCall(user));
      card.appendChild(span);
      card.appendChild(button);
      list.appendChild(card);
    });
  }
  leaveButton.addEventListener('click', () => {
    signal.leave();
    signal.disconnect();
    peer.end();
    render('enter');
  });
}

function bindCall() {
  attachLocalStream();
  attachRemoteStream();
  const endButton = document.getElementById('end-call');
  endButton.addEventListener('click', () => {
    endCall('Call ended.');
  });
}

function bindEnd() {
  const button = document.getElementById('back-to-lobby');
  const message = document.getElementById('end-message');
  if (connectionMessage) {
    message.textContent = connectionMessage;
    connectionMessage = '';
  }
  button.addEventListener('click', () => {
    render('lobby');
  });
}

async function startCall(target) {
  try {
    if (!localStream) {
      throw new Error('Local media unavailable');
    }
    render('call');
    await peer.start(target);
    attachLocalStream();
  } catch (error) {
    console.error('[App] Unable to start call', error);
    peer.end();
    remoteStream = null;
    connectionMessage = 'Failed to start call.';
    render('end');
  }
}

function attachLocalStream() {
  if (!localStream) {
    return;
  }
  const element = document.getElementById('local-video');
  if (element && element.srcObject !== localStream) {
    element.srcObject = localStream;
  }
}

function attachRemoteStream() {
  if (!remoteStream) {
    return;
  }
  const element = document.getElementById('remote-video');
  if (element && element.srcObject !== remoteStream) {
    element.srcObject = remoteStream;
  }
}

function endCall(message) {
  peer.end();
  remoteStream = null;
  connectionMessage = message || '';
  render('end');
}
