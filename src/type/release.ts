export interface Release {
  id?: number;
  authors: {
    [k: string]: unknown
  }[];
  commitCount: number;
  data: {
    [k: string]: unknown
  };
  dateCreated: string;
  dateReleased: string;
  deployCount: number;
  firstEvent: string;
  lastCommit: {
    [k: string]: unknown
  };
  lastDeploy:
    | {
    environment: string
    name: string
    dateStarted: string
    dateFinished: string
    url: string
    id: string
    [k: string]: unknown
  }
    | string;
  lastEvent: string;
  newGroups: number;
  owner: {
    [k: string]: unknown
  };
  projects: {
    name?: string
    slug?: string
    [k: string]: unknown
  }[];
  ref: string;
  shortVersion: string;
  version: string;
  url: string;

  [k: string]: unknown;
}
