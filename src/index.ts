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

server.listen(PORT, () => {
  console.info(`server started on port ${PORT}`);
});
