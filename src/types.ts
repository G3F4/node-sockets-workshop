export type StaticFileExtension = 'html' | 'css' | 'js' | 'ico';

export type Action = 'PARTICIPANT_LOGIN'
  | 'TRAINER_LOGIN'
  | 'TRAINER_NEEDED'
  | 'ISSUE_TAKEN'
  | 'ISSUE_SOLVED'
;

export type IssueStatus = 'PENDING' | 'TAKEN' | 'SOLVED';
