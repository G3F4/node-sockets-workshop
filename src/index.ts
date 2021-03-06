import { readFileSync } from 'fs';
import http from 'http';
import url from 'url';
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

const server = http.createServer( (request, response) => {
  try {
    const url = request.url && request.url !== '/' ? request.url : '/index.html';
    const urlParts = url.split('.');
    const fileExtension = urlParts[urlParts.length - 1] as StaticFileExtension;
    const contentType = FILE_EXTENSION_TO_CONTENT_TYPE[fileExtension];

    response.writeHead(200, { 'Content-Type': contentType });

    const file = readFileSync(`${process.cwd()}/public${url}`);

    response.end(file);
  } catch (e) {
    console.error(`error: ${e.toString()}`);
    response.end(e.toString());
  }
});

const sendEvent = (socket: WebSocket, event: Event): void => {
  try {
    socket.send(JSON.stringify(event));
  }

  catch (e) {
    console.error(e);
  }
};

const state: State = {
  participants: [],
  trainers: [],
  issues: [],
};

const webSocketsServer = new WebSocket.Server({ server });

webSocketsServer.on('connection', (socket: WebSocket, request) => {
  const { userId } = url.parse(request.url || '', true).query;
  const participant = state.participants.find(({ id }) => id === userId);
  const trainer = state.trainers.find(({ id }) => id === userId);
  console.log('socket connected');

  const connectedUser: User = participant || trainer || {
    id: `user-id-${Date.now()}`,
    data: {
      name: '',
      group: '',
    },
    socket,
  };

  if (participant || trainer) {
    connectedUser.socket = socket;
  }

  if (trainer) {
    sendEvent(connectedUser.socket, {
      action: 'ISSUES',
      payload: {
        issues: state.issues,
      },
    });
  }

  if (participant) {
    const participantIssues = state.issues.filter(it => it.userId === participant.id);
    const activeIssue = participantIssues[participantIssues.length - 1];

    if (activeIssue) {
      switch (activeIssue.status) {
        case 'PENDING': {
          sendEvent(connectedUser.socket, { action: 'ISSUE_RECEIVED' });
          break;
        }
        case 'TAKEN': {
          sendEvent(connectedUser.socket, {
            action: 'ISSUE_TAKEN',
            payload: {
              trainerName: activeIssue.trainerName,
            },
          });
          break;
        }
        case 'HINT': {
          sendEvent(connectedUser.socket, {
            action: 'HINT',
            payload: {
              hint: activeIssue.hint,
            },
          });
          break;
        }
        case 'SOLVED': {
          sendEvent(connectedUser.socket, {
            action: 'PARTICIPANT_LOGGED',
            payload: {
              userId: connectedUser.id,
            },
          });
          break;
        }
        default: {
          break;
        }
      }
    } else {
      sendEvent(connectedUser.socket, {
        action: 'PARTICIPANT_LOGGED',
        payload: {
          userId: connectedUser.id,
        },
      });
    }
  }

  socket.on('message', message => {
    console.log(['socket message'], message);
    const { action, payload } = JSON.parse(message.toString());

    switch (action as Action) {
      case 'PARTICIPANT_LOGIN': {
        connectedUser.data = payload;
        state.participants = [...state.participants, connectedUser];

        sendEvent(connectedUser.socket, {
          action: 'PARTICIPANT_LOGGED',
          payload: {
            userId: connectedUser.id,
          },
        });

        break;
      }
      case 'TRAINER_LOGIN': {
        connectedUser.data = payload;
        state.trainers = [...state.trainers, connectedUser];

        sendEvent(connectedUser.socket, {
          action: 'TRAINER_LOGGED',
          payload: {
            issues: state.issues,
            userId: connectedUser.id,
          },
        });

        break;
      }
      case 'TRAINER_NEEDED': {
        state.issues = [...state.issues, {
          id: `issue-id-${Date.now()}`,
          problem: payload.problem,
          status: 'PENDING',
          userId: connectedUser.id,
          userName: connectedUser.data.name,
          userGroup: connectedUser.data.group,
          hint: '',
          trainerName: '',
        }];

        sendEvent(connectedUser.socket, { action: 'ISSUE_RECEIVED' });

        state.trainers.forEach(({ socket }) => {
          sendEvent(socket, {
            action: 'ISSUES',
            payload: {
              issues: state.issues,
            },
          });
        });

        break;
      }
      case 'ISSUE_TAKEN': {
        const issue = state.issues.find(it => it.id === payload && it.status !== 'SOLVED');

        if (!issue) break;

        const participant = state.participants.find(it => it.id === issue.userId);

        if (!participant) break;

        sendEvent(participant.socket, {
          action: 'ISSUE_TAKEN',
          payload: {
            trainerName: connectedUser.data && connectedUser.data.name,
          },
        });

        issue.status = 'TAKEN';
        issue.trainerName = connectedUser.data && connectedUser.data.name;

        state.trainers.forEach(({ socket }) => {
          sendEvent(socket, {
            action: 'ISSUES',
            payload: {
              issues: state.issues,
            },
          });
        });

        break;
      }
      case 'ISSUE_SOLVED': {
        const issue = state.issues.find(it => it.userId === connectedUser.id && it.status !== 'SOLVED');

        if (!issue) break;

        issue.status = 'SOLVED';

        state.trainers.forEach(({ socket }) => {
          sendEvent(socket, {
            action: 'ISSUES',
            payload: {
              issues: state.issues,
            },
          });
        });

        break;
      }
      case 'HINT_SENT': {
        const participant = state.participants.find(it => it.id === payload.userId);

        if (!participant) break;

        const issue = state.issues.find(it => it.userId === participant.id && it.status !== 'SOLVED');

        if (!issue) break;

        sendEvent(participant.socket, {
          action: 'HINT',
          payload: {
            hint: payload.hint,
          },
        });

        issue.status = 'HINT';
        issue.hint = payload.hint;

        state.trainers.forEach(({ socket }) => {
          sendEvent(socket, {
            action: 'ISSUES',
            payload: {
              issues: state.issues,
            },
          });
        });

        break;
      }
      case 'HINT_FAIL': {
        const issue = state.issues.find(it => it.userId === connectedUser.id && it.status !== 'SOLVED');

        if (!issue) break;

        issue.status = 'PENDING';

        state.trainers.forEach(({ socket }) => {
          sendEvent(socket, {
            action: 'ISSUES',
            payload: {
              issues: state.issues,
            },
          });
        });

        break;
      }
      default: {
        console.error('unknown action');
      }
    }
  });

  socket.on('close', () => {
    console.log('socket closed');
  });
});

server.listen(PORT, () => {
  console.info(`server started on port ${PORT}`);
});
