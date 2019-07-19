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
};

const webSocketsServer = new WebSocket.Server({ server });

webSocketsServer.on('connection', (socket: WebSocket) => {
  console.log('socket connected');

  const connectedUser: User = {
    id: `user-id-${Date.now()}`,
    data: {
      name: '',
      group: '',
    },
    socket,
  };

  socket.send('welcome');

  socket.on('message', message => {
    console.log(['socket message'], message);
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
