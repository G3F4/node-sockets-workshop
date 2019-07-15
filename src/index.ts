import { readFileSync } from 'fs';
import http from 'http';
import * as process from 'process';
import { Server } from 'ws';
import { Action, IssueStatus, StaticFileExtension } from './types';

export interface User {
  id: string;
  data: {
    name: string;
    group?: string;
    code?: string;
  };
  socket: any;
}
export interface Issue {
  id: string;
  status: IssueStatus;
  userId: string;
  userName: string;
  userGroup: string;
  problem: string;
}

export interface State {
  participants: User[];
  trainers: User[];
  issues: Issue[];
}

const state: State = {
  participants: [],
  trainers: [],
  issues: [],
};

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
    const { action, payload } = JSON.parse(message.toString());

    console.log(['{ action, payload }'], { action, payload })

    switch (action as Action) {
      case 'PARTICIPANT_LOGIN': {
        const user = {
          id: `participant-id-${Date.now()}`,
          data: payload,
          socket: ws,
        };

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
          socket: ws,
        };

        state.trainers = [...state.trainers, user];

        user.socket.send(JSON.stringify({
          action: 'TRAINER_LOGGED',
          payload: state.issues,
        }));

        break;
      }
      case 'TRAINER_NEEDED': {
        console.log('TRAINER_NEEDED');
        const user = state.participants.find(it => it.socket === ws);

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
        console.log('ISSUE_TAKEN');
        const issue = state.issues.find(it => it.id === payload);
        const trainer = state.trainers.find(it => it.socket === ws);

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
        console.log('ISSUE_SOLVED');
        const participant = state.participants.find(it => it.socket === ws);

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
      default: {
        console.log('unknown action');
      }
    }
  });
});

server.listen(process.env.PORT || 3000, () => {
  process.stdout.write('server started\n');
});
