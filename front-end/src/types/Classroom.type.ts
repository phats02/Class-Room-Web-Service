import { User } from "../redux-toolkit/slice/auth.slice";

export type Assignment = {
  _id: string;
  name: string;
  point: number;
};

export type ClassRoom = {
  name: string;
  description: string;
  students: User[];
  teachers: User[];
  owner: User;
  joinId: string;
  _id: string;
  updatedAt: string;
  assignments: Assignment[];
  slug: string;
};
