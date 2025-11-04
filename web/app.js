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
let deviceChangeHandlerRegistered = false;

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
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    connectionMessage = 'Media devices are not supported in this browser.';
    stopStreamTracks(localStream);
    localStream = null;
    attachLocalStream();
    return;
  }

  if (!deviceChangeHandlerRegistered) {
    const handler = () => {
      prepareMedia();
    };
    if (typeof navigator.mediaDevices.addEventListener === 'function') {
      navigator.mediaDevices.addEventListener('devicechange', handler);
    } else {
      navigator.mediaDevices.ondevicechange = handler;
    }
    deviceChangeHandlerRegistered = true;
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasAudioInput = devices.some((device) => device.kind === 'audioinput');
    const hasVideoInput = devices.some((device) => device.kind === 'videoinput');

    console.info('[App] Media capabilities:', { audio: hasAudioInput, video: hasVideoInput });

    const constraints = {};
    if (hasAudioInput) {
      constraints.audio = true;
    }
    if (hasVideoInput) {
      constraints.video = true;
    }

    if (!hasAudioInput && !hasVideoInput) {
      stopStreamTracks(localStream);
      localStream = null;
      connectionMessage = 'No camera or microphone detected.';
      attachLocalStream();
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    if (localStream && localStream !== stream) {
      stopStreamTracks(localStream);
    }
    localStream = stream;
    connectionMessage = '';
    if (peer) {
      peer.setLocalStream(localStream);
    }
    attachLocalStream();
  } catch (error) {
    console.error('[App] Unable to access media devices', error);
    connectionMessage = 'Unable to access media devices.';
    stopStreamTracks(localStream);
    localStream = null;
    attachLocalStream();
  }
}

function setupSignalClient() {
  const scheme = location.protocol === 'https:' ? 'wss://' : 'ws://';
  const host = location.host || 'localhost';
  const endpoint = '/signal';
  signal = new SignalClient(`${scheme}${host}${endpoint}`);

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
        localStream = new MediaStream();
      }
      peer.setLocalStream(localStream);
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
  document.body.classList.toggle('state-call', state === 'call');
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
      localStream = new MediaStream();
    }
    peer.setLocalStream(localStream);
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
  const element = document.getElementById('local-video');
  const message = document.getElementById('no-media');
  const hasLocalTracks = Boolean(localStream && localStream.getTracks().length > 0);

  if (element) {
    if (hasLocalTracks) {
      if (element.srcObject !== localStream) {
        element.srcObject = localStream;
      }
      element.hidden = false;
    } else {
      element.srcObject = null;
      element.hidden = true;
    }
  }

  if (message) {
    message.hidden = hasLocalTracks;
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
  stopStreamTracks(localStream);
  localStream = null;
  remoteStream = null;
  connectionMessage = message || '';
  render('end');
  prepareMedia();
}

function stopStreamTracks(stream) {
  if (!stream) {
    return;
  }
  stream.getTracks().forEach((track) => {
    track.stop();
  });
}
