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

webSocketsServer.on('connection', socket => {
  socket.on('message', message => {
    const { action, payload } = JSON.parse(message.toString());

    switch (action as Action) {
      case 'PARTICIPANT_LOGIN': {
        const user = {
          id: `participant-id-${Date.now()}`,
          data: payload,
          socket,
        } as User;

        state.participants = [...state.participants, user];

        user.socket.send(JSON.stringify({
          action: 'PARTICIPANT_LOGGED',
        }));

        break;
      }
      case 'TRAINER_LOGIN': {
        const user = {
          id: `trainer-id-${Date.now()}`,
          data: payload,
          socket,
        } as User;

        state.trainers = [...state.trainers, user];

        user.socket.send(JSON.stringify({
          action: 'TRAINER_LOGGED',
          payload: state.issues,
        }));

        break;
      }
      case 'TRAINER_NEEDED': {
        const user = state.participants.find(it => it.socket === socket);

        if (!user) break;

        state.issues = [...state.issues, {
          id: `issue-id-${Date.now()}`,
          problem: payload.problem,
          status: 'PENDING',
          userId: user.id,
          userName: user.data.name,
          userGroup: user.data.group as string,
        }];

        user.socket.send(JSON.stringify({
          action: 'ISSUE_RECEIVED',
        }));

        state.trainers.forEach(({ socket }) => {
          socket.send(JSON.stringify({
            action: 'ISSUES',
            payload: state.issues,
          }));
        });

        break;
      }
      case 'ISSUE_TAKEN': {
        const issue = state.issues.find(it => it.id === payload);
        const trainer = state.trainers.find(it => it.socket === socket);

        if (!issue || !trainer) break;

        const participant = state.participants.find(it => it.id === issue.userId);

        if (!participant) break;

        participant.socket.send(JSON.stringify({
          action: 'ISSUE_TAKEN',
          payload: trainer.data.name,
        }));

        issue.status = 'TAKEN';

        state.trainers.forEach(({ socket }) => {
          socket.send(JSON.stringify({
            action: 'ISSUES',
            payload: state.issues,
          }));
        });

        break;
      }
      case 'ISSUE_SOLVED': {
        const participant = state.participants.find(it => it.socket === socket);

        if (!participant) break;

        const issue = state.issues.find(it => it.userId === participant.id);

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
        const participant = state.participants.find(it => it.socket === socket);

        if (!participant) break;

        const issue = state.issues.find(it => it.userId === participant.id);

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
});

server.listen(PORT, () => {
  console.info(`server started on port ${PORT}`);
});
