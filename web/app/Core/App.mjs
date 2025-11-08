/**
 * @module HomeCall_Web_Core_App
 * @description Main application orchestrator for HomeCall frontend.
 */

export default class HomeCall_Web_Core_App {
  constructor({
    HomeCall_Web_Core_TemplateLoader$: templates,
    HomeCall_Web_Core_ServiceWorkerManager$: sw,
    HomeCall_Web_Core_VersionWatcher$: version,
    HomeCall_Web_Media_Manager$: media,
    HomeCall_Web_Net_SignalClient$: signal,
    HomeCall_Web_Rtc_Peer$: peer,
    HomeCall_Web_Ui_Screen_Enter$: screenEnter,
    HomeCall_Web_Ui_Screen_Lobby$: screenLobby,
    HomeCall_Web_Ui_Screen_Call$: screenCall,
    HomeCall_Web_Ui_Screen_End$: screenEnd,
    'document$': docSingleton,
    'window$': winSingleton
  } = {}) {
    const document = docSingleton ?? globalThis.document;
    const window = winSingleton ?? globalThis.window;
    const state = {
      root: null,
      currentState: null,
      userName: '',
      roomCode: '',
      onlineUsers: [],
      remoteStream: null,
      connectionMessage: ''
    };

    const updateBodyState = () => {
      if (!document?.body) {
        return;
      }
      document.body.classList.toggle('state-call', state.currentState === 'call');
    };

    const showLobby = () => {
      state.currentState = 'lobby';
      updateBodyState();
      screenLobby.show({
        container: state.root,
        roomCode: state.roomCode,
        users: state.onlineUsers,
        onCall: (user) => {
          startCall(user);
        },
        onLeave: () => {
          signal.disconnect();
          peer.end();
          state.remoteStream = null;
          state.onlineUsers = [];
          showEnter();
        }
      });
    };

    const showEnd = () => {
      state.currentState = 'end';
      updateBodyState();
      screenEnd.show({
        container: state.root,
        message: state.connectionMessage,
        onBack: () => {
          state.connectionMessage = '';
          showLobby();
        }
      });
    };

    const endCall = (message) => {
      peer.end();
      media.stopLocalStream();
      media.setLocalStream(null);
      state.remoteStream = null;
      state.connectionMessage = message || '';
      showEnd();
      media.prepare().catch((error) => {
        console.error('[App] Unable to prepare media after ending call', error);
      });
    };

    const showCall = () => {
      state.currentState = 'call';
      updateBodyState();
      screenCall.show({
        container: state.root,
        remoteStream: state.remoteStream,
        onEnd: () => {
          endCall('Call ended.');
        },
        onRetry: () => {
          media.prepare().catch((error) => {
            console.error('[App] Unable to re-prepare media', error);
          });
        }
      });
    };

    const showEnter = () => {
      state.currentState = 'enter';
      updateBodyState();
      const message = state.connectionMessage;
      state.connectionMessage = '';
      screenEnter.show({
        container: state.root,
        connectionMessage: message,
        onEnter: ({ user, room }) => {
          state.userName = user;
          state.roomCode = room;
          state.connectionMessage = '';
          showLobby();
        }
      });
    };

    const startCall = async (target) => {
      try {
        let localStream = media.getLocalStream();
        if (!localStream) {
          localStream = new MediaStream();
        }
        media.setLocalStream(localStream);
        showCall();
        await peer.start(target);
      } catch (error) {
        console.error('[App] Unable to start call', error);
        peer.end();
        state.remoteStream = null;
        state.connectionMessage = 'Failed to start call.';
        showEnd();
      }
    };

    const configurePeer = () => {
      peer.configure({
        sendOffer: (to, sdp) => signal.sendOffer(to, sdp),
        sendAnswer: (to, sdp) => signal.sendAnswer(to, sdp),
        sendCandidate: (to, candidate) => signal.sendCandidate(to, candidate),
        onRemoteStream: (stream) => {
          state.remoteStream = stream;
          if (state.currentState === 'call') {
            screenCall.updateRemoteStream(stream);
          }
        },
        onStateChange: (peerState) => {
          if (peerState === 'disconnected' || peerState === 'failed') {
            endCall('Connection lost.');
          }
        }
      });
    };

    const setupSignalClient = () => {
      signal.on('online', (users) => {
        state.onlineUsers = (users || []).filter((user) => user !== state.userName);
        if (state.currentState === 'lobby') {
          showLobby();
        }
      });

      signal.on('offer', async (data) => {
        if (state.currentState !== 'call') {
          showCall();
        }
        try {
          if (!media.getLocalStream()) {
            media.setLocalStream(new MediaStream());
          }
          await peer.handleOffer(data);
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
        state.connectionMessage = data?.message || 'Signal error occurred.';
        if (state.currentState === 'enter') {
          showEnter();
        }
      });

      signal.on('status', ({ state: status }) => {
        if (status === 'closed' && state.currentState !== 'enter') {
          peer.end();
          state.remoteStream = null;
          state.connectionMessage = 'Connection to the signaling server lost.';
          showEnter();
        }
      });
    };

    this.run = async () => {
      if (!document) {
        throw new Error('Document is not available for HomeCall application.');
      }
      state.root = document.getElementById('app');
      if (!state.root) {
        throw new Error('Element with id "app" was not found.');
      }
      configurePeer();
      media.setPeer(peer);
      await sw.register();
      await templates.loadAll();
      await version.start();
      setupSignalClient();
      showEnter();
    };
  }
}
