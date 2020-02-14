export interface Ticket {
  id?: string;
  date: Date;
  title: string;
  question: string;
  status: Status;
  device: string;
  browser: string;
  project: string;
  user: string;
  communication?: Communication[];
}

export interface Communication {
  date: Date;
  content: string;
  type: Type;
}

export enum Status {
  NEW,
  IN_PROGRESS,
  WAITING,
  DONE
}

export enum Type {
  USER,
  ADMIN
}
