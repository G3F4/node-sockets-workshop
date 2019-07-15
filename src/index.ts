import { readFileSync } from 'fs';
import http from 'http';
import * as process from 'process';
import { Server } from 'ws';
import { CounterAction, StaticFileExtension } from './types';

let counter = 0;

const server = http.createServer({}, (req, res) => {
  try {
    // read url
    const url = req.url && req.url !== '/' ? req.url : '/index.html';
    process.stdout.write(`${url}\n`);
    process.stdout.write(`${JSON.stringify(req.headers)}\n`);

    // split url by dot to extract file extension
    const urlParts = url.split('.');
    const fileExtension = urlParts[urlParts.length - 1] as StaticFileExtension;
    let contentType = '';

    // set Content-Type header based on file extension
    switch (fileExtension) {
      case 'html': {
        contentType = 'text/html';
        break;
      }
      case 'css': {
        contentType = 'text/css';
        break;
      }
      case 'js': {
        contentType = 'text/javascript';
        break;
      }
      case 'ico': {
        // TODO dlaczego ikona jest pusta
        contentType = 'image/x-icon';
        break;
      }
      default:
        contentType = 'text/html';
    }

    res.writeHead(200, {
      'Content-Type': contentType,
    });

    // read file
    const file = readFileSync(`${process.cwd()}/public${url}`, 'utf8');

    // end response - send
    res.end(file);
  } catch (e) {
    process.stdout.write(`error: ${e.toString()}\n`);
    res.end(e.toString());
  }
});
const wss = new Server({ server });

wss.on('connection', ws => {
  process.stdout.write('connection\n');
  ws.on('message', message => {
    process.stdout.write('message\n');
    const { action } = JSON.parse(message.toString());

    if (action as CounterAction === 'increment') {
      counter++;
      wss.clients.forEach(socket => {
        socket.send(JSON.stringify({ action: 'update', data: counter }));
      });
    }
  });

  ws.send(JSON.stringify({ action: 'update', data: counter }));
});

server.listen(process.env.PORT || 3000, () => {
  process.stdout.write('server started\n');
});
