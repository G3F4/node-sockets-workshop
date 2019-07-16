import * as WebSocket from 'ws';

export type StaticFileExtension = 'html' | 'css' | 'js' | 'ico';

export type ContentType = 'image/x-icon' | 'text/html' | 'text/css' | 'text/javascript';

export type FileExtensionToContentTypeMap = {
  [id in StaticFileExtension]: ContentType;
};

export type Action = 'PARTICIPANT_LOGIN'
  | 'TRAINER_LOGIN'
  | 'TRAINER_NEEDED'
  | 'ISSUE_TAKEN'
  | 'ISSUE_SOLVED'
;

export type IssueStatus = 'PENDING' | 'TAKEN' | 'SOLVED';

export interface User {
  id: string;
  data: {
    name: string;
    group?: string;
  };
  socket: WebSocket;
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
