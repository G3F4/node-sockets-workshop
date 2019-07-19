import { readFileSync } from 'fs';
import http from 'http';
import * as process from 'process';
import * as WebSocket from 'ws';
import {
  Action,
  FileExtensionToContentTypeMap,
  State,
  StaticFileExtension,
  User,
  Event,
} from './types';

const PORT = process.env.PORT || 5000;

const FILE_EXTENSION_TO_CONTENT_TYPE: FileExtensionToContentTypeMap = {
  css: 'text/css',
  html: 'text/html',
  ico: 'image/x-icon',
  js: 'text/javascript',
};

const server = http.createServer({}, (req, res) => {
  try {
    const url = req.url && req.url !== '/' ? req.url : '/index.html';
    const urlParts = url.split('.');
    const fileExtension = urlParts[urlParts.length - 1] as StaticFileExtension;
    const contentType = FILE_EXTENSION_TO_CONTENT_TYPE[fileExtension];

    res.writeHead(200, { 'Content-Type': contentType });

    const file = readFileSync(`${process.cwd()}/public${url}`);

    res.end(file);
  } catch (e) {
    console.error(`error: ${e.toString()}`);
    res.end(e.toString());
  }
});

const state: State = {
  participants: [],
  trainers: [],
  issues: [],
};

const webSocketsServer = new WebSocket.Server({ server });

const sendEvent = (socket: WebSocket, event: Event): void => {
  try {
    socket.send(JSON.stringify(event));
  }

  catch (e) {
    console.error(e);
  }
};

webSocketsServer.on('connection', (socket: WebSocket) => {
  const connectedUser: User = {
    id: `user-id-${Date.now()}`,
    data: {
      name: '',
      group: '',
    },
    socket,
  };

  socket.on('message', message => {
    const { action, payload } = JSON.parse(message.toString());

    switch (action as Action) {
      case 'PARTICIPANT_LOGIN': {
        connectedUser.data = payload;
        state.participants = [...state.participants, connectedUser];

        sendEvent(connectedUser.socket, { action: 'PARTICIPANT_LOGGED' });

        break;
      }
      case 'TRAINER_LOGIN': {
        connectedUser.data = payload;
        state.trainers = [...state.trainers, connectedUser];

        sendEvent(connectedUser.socket, {
          action: 'TRAINER_LOGGED',
          payload: state.issues,
        });

        break;
      }
      case 'TRAINER_NEEDED': {
        if (!connectedUser) break;

        state.issues = [...state.issues, {
          id: `issue-id-${Date.now()}`,
          problem: payload.problem,
          status: 'PENDING',
          userId: connectedUser.id,
          userName: connectedUser.data.name,
          userGroup: connectedUser.data.group,
        }];

        connectedUser.socket.send(JSON.stringify({ action: 'ISSUE_RECEIVED' }));

        sendEvent(connectedUser.socket, { action: 'ISSUE_RECEIVED' });

        state.trainers.forEach(({ socket }) => {
          sendEvent(socket, {
            action: 'ISSUES',
            payload: state.issues,
          });
        });

        break;
      }
      case 'ISSUE_TAKEN': {
        const issue = state.issues.find(it => it.id === payload);

        if (!issue || !connectedUser) break;

        const participant = state.participants.find(it => it.id === issue.userId);

        if (!participant) break;

        sendEvent(participant.socket, {
          action: 'ISSUE_TAKEN',
          payload: connectedUser.data && connectedUser.data.name,
        });

        issue.status = 'TAKEN';

        state.trainers.forEach(({ socket }) => {
          sendEvent(socket, {
            action: 'ISSUES',
            payload: state.issues,
          });
        });

        break;
      }
      case 'ISSUE_SOLVED': {
        if (!connectedUser) break;

        const issue = state.issues.find(it => it.userId === connectedUser.id);

        if (!issue) break;

        issue.status = 'SOLVED';

        state.trainers.forEach(({ socket }) => {
          socket.send(JSON.stringify({
            action: 'ISSUES',
            payload: state.issues,
          }));
        });

        break;
      }
      case 'HINT_SENT': {
        const participant = state.participants.find(it => it.id === payload.userId);

        if (!participant) break;

        const issue = state.issues.find(it => it.userId === participant.id);

        if (!issue) break;

        participant.socket.send(JSON.stringify({
          action: 'HINT_RECEIVED',
          payload: payload.hint,
        }));

        issue.status = 'HINT';

        state.trainers.forEach(({ socket }) => {
          socket.send(JSON.stringify({
            action: 'ISSUES',
            payload: state.issues,
          }));
        });

        break;
      }
      case 'HINT_FAIL': {
        if (!connectedUser) break;

        const issue = state.issues.find(it => it.userId === connectedUser.id);

        if (!issue) break;

        issue.status = 'PENDING';

        state.trainers.forEach(({ socket }) => {
          socket.send(JSON.stringify({
            action: 'ISSUES',
            payload: state.issues,
          }));
        });

        break;
      }
      default: {
        console.error('unknown action');
      }
    }
  });

  socket.on('close', () => {
    state.participants = state.participants.filter(user => user.socket !== socket);
    state.trainers = state.trainers.filter(user => user.socket !== socket);
  });
});

server.listen(PORT, () => {
  console.info(`server started on port ${PORT}`);
});
