import { User } from "../redux-toolkit/slice/auth.slice";

export type Grade = {
  id: string; // student id
  grade: number;
  draft: boolean;
  _id: string;
};

export type Assignment = {
  _id: string;
  name: string;
  point: number;
  grades: Grade[];
  createAt: string;
  updateAt: string;
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
