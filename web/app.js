import { SignalClient } from './ws/client.js';
import { PeerSession } from './rtc/peer.js';

const appRoot = document.getElementById('app');
const toastNode = document.getElementById('toast');
const templateCache = new Map();
let toastTimer = null;

const signal = new SignalClient();

const state = {
  screen: null,
  localStream: null,
  remoteStream: null,
  deviceStatus: 'Checking camera and microphone…',
  deviceError: false,
  displayName: '',
  accessCode: '',
  clientId: null,
  users: [],
  connected: false,
  peer: null,
  currentTarget: null,
  callEndedReason: '',
  versionTimer: null
};

function showToast(message, duration = 3200) {
  if (!toastNode) {
    console.warn('Toast node is missing');
    return;
  }
  toastNode.textContent = message;
  toastNode.classList.add('visible');
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(() => {
    toastNode.classList.remove('visible');
  }, duration);
}

async function loadTemplate(name) {
  if (!templateCache.has(name)) {
    const response = await fetch(`ui/${name}.html`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load template ${name}`);
    }
    templateCache.set(name, await response.text());
  }
  return templateCache.get(name);
}

async function setScreen(name) {
  const html = await loadTemplate(name);
  appRoot.innerHTML = html;
  state.screen = name;

  switch (name) {
    case 'enter':
      setupEnterScreen();
      break;
    case 'lobby':
      setupLobbyScreen();
      break;
    case 'call':
      setupCallScreen();
      break;
    case 'end':
      setupEndScreen();
      break;
    default:
      break;
  }
}

function navigateTo(name) {
  setScreen(name).catch((err) => {
    console.error(`Failed to render screen ${name}`, err);
    showToast('Unable to update the interface.');
  });
}

function setDeviceStatus(message, isError = false) {
  state.deviceStatus = message;
  state.deviceError = isError;
  const element = document.getElementById('device-status');
  if (element) {
    element.textContent = message;
    element.classList.toggle('error', isError);
  }
}

async function ensureMedia() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setDeviceStatus('Media devices are not available in this browser.', true);
    showToast('Camera or microphone not available.');
    return null;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    state.localStream = stream;
    setDeviceStatus('Camera and microphone ready.');
    return stream;
  } catch (err) {
    console.error('Media request failed', err);
    setDeviceStatus('Unable to access camera or microphone.', true);
    showToast('Allow camera and microphone to place calls.');
    return null;
  }
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('service-worker.js', { scope: './' });
    return registration;
  } catch (err) {
    console.warn('Failed to register service worker', err);
    return null;
  }
}

async function checkVersion() {
  try {
    const response = await fetch('version.json', { cache: 'no-store' });
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    const key = 'homecall-version';
    const previous = localStorage.getItem(key);
    if (previous && previous !== data.version) {
      localStorage.setItem(key, data.version);
      showToast('Updating HomeCall…');
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage('skip-waiting');
      }
      setTimeout(() => window.location.reload(), 500);
    } else if (!previous) {
      localStorage.setItem(key, data.version);
    }
  } catch (err) {
    console.warn('Version check failed', err);
  }
}

function setupSignalHandlers() {
  signal.on('open', (payload) => {
    handleWelcome(payload).catch((err) => {
      console.error('Failed to enter lobby', err);
    });
  });

  const handleUsers = (payload) => {
    const users = Array.isArray(payload?.users) ? payload.users : [];
    state.users = users;
    refreshLobbyUsers();
  };

  signal.on('users:update', handleUsers);
  signal.on('users:list', handleUsers);
  signal.on('users', handleUsers);

  signal.on('call:offer', (payload) => {
    handleIncomingOffer(payload).catch((err) => {
      console.error('Failed to handle offer', err);
    });
  });

  signal.on('call:answer', async (payload) => {
    if (!state.peer) {
      return;
    }
    const description = extractDescription(payload);
    if (!description) {
      return;
    }
    try {
      await state.peer.applyAnswer(description);
      updateCallSubtitle(`Talking with ${state.currentTarget?.name || 'guest'}`);
    } catch (err) {
      console.error('Failed to apply answer', err);
    }
  });

  signal.on('call:candidate', async (payload) => {
    if (!state.peer) {
      return;
    }
    const candidate = payload?.candidate || payload;
    try {
      await state.peer.addIceCandidate(candidate);
    } catch (err) {
      console.error('Failed to add candidate', err);
    }
  });

  signal.on('call:end', (payload) => {
    const reason = payload?.reason || 'Call ended by partner.';
    concludeCall(reason, false);
  });

  signal.on('close', () => {
    state.connected = false;
    state.users = [];
    if (state.screen !== 'enter') {
      showToast('Disconnected from server.');
      navigateTo('enter');
    }
  });

  signal.on('error', (err) => {
    console.error('Signal error', err);
    showToast('Signal error. Retrying…');
  });
}

async function handleWelcome(payload) {
  state.connected = true;
  state.clientId = payload?.id ?? payload?.clientId ?? null;
  if (payload?.name) {
    state.displayName = payload.name;
  }
  if (Array.isArray(payload?.users)) {
    state.users = payload.users;
  }
  showToast('Connected to lobby.');
  await setScreen('lobby');
  try {
    signal.requestUsers();
  } catch (err) {
    console.error('Failed to request users after welcome', err);
  }
}

function setupEnterScreen() {
  const form = document.getElementById('enter-form');
  const nameInput = document.getElementById('display-name');
  const codeInput = document.getElementById('access-code');

  if (nameInput) {
    nameInput.value = state.displayName;
  }
  if (codeInput) {
    codeInput.value = state.accessCode;
  }

  const statusElement = document.getElementById('device-status');
  if (statusElement) {
    statusElement.textContent = state.deviceStatus;
    statusElement.classList.toggle('error', state.deviceError);
  }

  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const displayName = nameInput.value.trim();
    const accessCode = codeInput.value.trim();

    if (!displayName || !accessCode) {
      showToast('Both name and passphrase are required.');
      return;
    }

    state.displayName = displayName;
    state.accessCode = accessCode;

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      await signal.connect({ name: displayName, code: accessCode });
    } catch (err) {
      console.error('Connection failed', err);
      showToast('Unable to connect. Please try again.');
      setDeviceStatus('Unable to connect to lobby.', true);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}

function setupLobbyScreen() {
  const subtitle = document.getElementById('lobby-subtitle');
  if (subtitle) {
    subtitle.textContent = state.displayName
      ? `You are connected as ${state.displayName}.`
      : 'You are connected.';
  }
  refreshLobbyUsers();

  const leaveButton = document.getElementById('leave-lobby');
  if (leaveButton) {
    leaveButton.addEventListener('click', () => {
      if (state.peer) {
        concludeCall('Call ended by you.', true);
      }
      state.connected = false;
      state.users = [];
      signal.disconnect();
      navigateTo('enter');
    });
  }

  const refreshButton = document.getElementById('refresh-users');
  if (refreshButton) {
    refreshButton.addEventListener('click', () => {
      try {
        signal.requestUsers();
      } catch (err) {
        console.error('Failed to request users', err);
      }
    });
  }
}

function refreshLobbyUsers() {
  if (state.screen !== 'lobby') {
    return;
  }

  const list = document.getElementById('user-list');
  const status = document.getElementById('lobby-status');

  if (!list || !status) {
    return;
  }

  list.innerHTML = '';
  const users = state.users || [];
  const others = users.filter((user) => !isSameUser(user, state.clientId));

  if (!users.length) {
    status.textContent = 'No users online yet.';
    return;
  }

  status.textContent = others.length
    ? `${others.length} participant(s) available.`
    : 'Waiting for other participants…';

  users.forEach((user) => {
    const item = document.createElement('li');
    item.classList.add('user-card');
    const name = typeof user === 'string' ? user : user?.name || 'Unknown';
    const id = getUserId(user);

    if (isSameUser(user, state.clientId)) {
      item.classList.add('self');
      item.innerHTML = `<span>${name} (you)</span>`;
    } else {
      const title = document.createElement('span');
      title.textContent = name;
      const callButton = document.createElement('button');
      callButton.textContent = 'Call';
      callButton.addEventListener('click', () => {
        startOutgoingCall({ id, name }).catch((err) => {
          console.error('Failed to start call', err);
        });
      });
      item.appendChild(title);
      item.appendChild(callButton);
    }
    list.appendChild(item);
  });
}

async function startOutgoingCall(target) {
  if (!state.localStream) {
    await ensureMedia();
    if (!state.localStream) {
      showToast('Cannot start call without media permissions.');
      return;
    }
  }

  state.currentTarget = target;
  state.remoteStream = null;
  state.peer = createPeerSession(target.id);

  await setScreen('call');
  updateCallSubtitle(`Calling ${target.name || 'guest'}…`);
  attachLocalVideo();

  try {
    const offer = await state.peer.createOffer();
    signal.sendOffer(target.id, offer);
  } catch (err) {
    console.error('Offer creation failed', err);
    showToast('Failed to start the call.');
    concludeCall('Could not start the call.', false);
  }
}

async function handleIncomingOffer(payload) {
  if (!state.localStream) {
    await ensureMedia();
    if (!state.localStream) {
      showToast('Camera and microphone access is required to answer.');
      return;
    }
  }

  const from = normalizeUser(payload?.from, payload);
  state.currentTarget = from;
  state.remoteStream = null;
  state.peer = createPeerSession(from.id);

  await setScreen('call');
  updateCallSubtitle(`Answering ${from.name || 'guest'}…`);
  attachLocalVideo();

  const description = extractDescription(payload);
  if (!description) {
    showToast('Incoming offer was invalid.');
    concludeCall('Call could not be established.', false);
    return;
  }

  try {
    const answer = await state.peer.acceptOffer(description);
    signal.sendAnswer(from.id, answer);
    showToast(`Connected with ${from.name || 'guest'}.`);
    updateCallSubtitle(`Talking with ${from.name || 'guest'}`);
  } catch (err) {
    console.error('Failed to answer offer', err);
    showToast('Unable to answer the call.');
    concludeCall('Call failed to connect.', false);
  }
}

function createPeerSession(targetId) {
  const session = new PeerSession(state.localStream);
  session.onRemoteTrack = (stream) => {
    state.remoteStream = stream;
    attachRemoteVideo();
  };
  session.onIceCandidate = (candidate) => {
    if (!targetId) {
      return;
    }
    try {
      signal.sendCandidate(targetId, candidate);
    } catch (err) {
      console.error('Failed to send ICE candidate', err);
    }
  };
  session.onConnectionStateChange = (connectionState) => {
    if (['disconnected', 'failed'].includes(connectionState)) {
      concludeCall('Connection lost.', false);
    }
  };
  return session;
}

function setupCallScreen() {
  attachLocalVideo();
  attachRemoteVideo();
  updateCallSubtitle(state.currentTarget ? `Talking with ${state.currentTarget.name || 'guest'}` : 'Connecting…');

  const endButton = document.getElementById('end-call');
  if (endButton) {
    endButton.addEventListener('click', () => {
      concludeCall('Call ended by you.', true);
    });
  }
}

function setupEndScreen() {
  const details = document.getElementById('end-details');
  const summary = state.callEndedReason || 'Connection closed.';
  if (details) {
    details.textContent = summary;
    details.classList.toggle('error', summary.toLowerCase().includes('fail'));
  }

  const button = document.getElementById('back-to-lobby');
  if (button) {
    button.addEventListener('click', () => {
      if (state.connected) {
        navigateTo('lobby');
      } else {
        navigateTo('enter');
      }
    });
  }
}

function attachLocalVideo() {
  if (state.screen !== 'call') {
    return;
  }
  const element = document.getElementById('local-video');
  if (element && state.localStream && element.srcObject !== state.localStream) {
    element.srcObject = state.localStream;
  }
}

function attachRemoteVideo() {
  if (state.screen !== 'call') {
    return;
  }
  const element = document.getElementById('remote-video');
  if (element && state.remoteStream && element.srcObject !== state.remoteStream) {
    element.srcObject = state.remoteStream;
  }
}

function updateCallSubtitle(text) {
  const subtitle = document.getElementById('call-subtitle');
  if (subtitle) {
    subtitle.textContent = text;
  }
}

function concludeCall(message, notifyRemote = false) {
  const targetId = state.currentTarget?.id;
  if (notifyRemote && targetId) {
    try {
      signal.sendEnd(targetId);
    } catch (err) {
      console.error('Failed to notify remote about call end', err);
    }
  }

  if (state.peer) {
    try {
      state.peer.close();
    } catch (err) {
      console.error('Failed to close peer session', err);
    }
    state.peer = null;
  }

  state.remoteStream = null;
  state.callEndedReason = message || '';
  const shouldReturnToLobby = state.connected;
  const wasInCall = state.screen === 'call';
  state.currentTarget = null;
  if (wasInCall) {
    navigateTo(shouldReturnToLobby ? 'end' : 'enter');
  } else if (!shouldReturnToLobby && message) {
    showToast(message);
  }
}

function extractDescription(payload) {
  return payload?.description || payload?.offer || payload?.answer || payload?.sdp || null;
}

function normalizeUser(user, fallback = {}) {
  if (!user) {
    const id = fallback?.fromId ?? fallback?.sourceId ?? fallback?.targetId ?? null;
    return { id, name: fallback?.fromName || 'Guest' };
  }
  if (typeof user === 'string') {
    return { id: user, name: user };
  }
  return {
    id: user.id ?? user.uid ?? user.clientId ?? user.sessionId ?? null,
    name: user.name ?? user.displayName ?? 'Guest'
  };
}

function getUserId(user) {
  if (!user) {
    return null;
  }
  if (typeof user === 'string') {
    return user;
  }
  return user.id ?? user.uid ?? user.clientId ?? user.sessionId ?? null;
}

function isSameUser(user, id) {
  if (!user || id == null) {
    return false;
  }
  return getUserId(user) === id;
}

async function bootstrap() {
  await registerServiceWorker();
  await ensureMedia();
  setupSignalHandlers();
  await setScreen('enter');
  await checkVersion();
  state.versionTimer = setInterval(checkVersion, 60_000);
}

bootstrap().catch((err) => {
  console.error('HomeCall bootstrap failed', err);
  showToast('Failed to start application.');
});
