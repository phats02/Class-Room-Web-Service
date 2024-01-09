import { ClassRoom, Assignment, Grade } from "../types/Classroom.type";
import { FailedResponse } from "../types/Response.type";
import { configuredAxios } from "./axios-config";

const getAllClass = async () => {
  const res = await configuredAxios.get("/courses");
  return res.data;
};

type CreateClassRequest = {
  name: string;
  description: string;
};

type CreateClassResponse =
  | FailedResponse
  | {
      code: number;
      success: true;
      course: ClassRoom;
    };
const createClass = async (
  classInfo: CreateClassRequest
): Promise<CreateClassResponse> => {
  const res = await configuredAxios.post("/courses/store", classInfo);
  return res.data;
};

const getCurrentClassInfo = async (
  id: string
): Promise<CreateClassResponse> => {
  const res = await configuredAxios.get("/courses/" + id);
  return res.data;
};

const joinClassWithCode = async (
  classCode: string
): Promise<CreateClassResponse> => {
  const res = await configuredAxios.get("/courses/join/" + classCode);
  return res.data;
};

type UpdateClassroomRequest = {
  name: string;
  description: string;
  grades: Assignment;
};

const updateClassroom = async (
  id: string,
  classInfo: UpdateClassroomRequest
) => {
  const res = await configuredAxios.put("/courses/" + id, classInfo);
  return res.data;
};

export enum ClassRoomRole {
  TEACHER,
  STUDENT,
}
type InviteBody = {
  email: string;
  courseId: string;
  type: ClassRoomRole;
};

const inviteUser = async (inviteInfo: InviteBody) => {
  const res = await configuredAxios.post("/courses/invite", inviteInfo);
  return res.data;
};

const deleteClass = async (classId: string): Promise<FailedResponse> => {
  const res = await configuredAxios.delete("/courses/" + classId);
  return res.data;
};

type AssignmentResponse = {
  code: Number;
  success: true;
  message: string;
  assignment: Assignment;
};

const addAssignment = async (
  classSlug: string,
  item: Assignment
): Promise<FailedResponse | AssignmentResponse> => {
  const res = await configuredAxios.post(
    "/courses/" + classSlug + "/assignment",
    item
  );
  return res.data;
};

const updateAssignment = async (
  classSlug: string,
  assignmentId: string,
  item: Assignment
): Promise<FailedResponse | AssignmentResponse> => {
  const res = await configuredAxios.patch(
    "/courses/" + classSlug + "/assignment/" + assignmentId,
    item
  );
  return res.data;
};

const deleteAssignment = async (
  classSlug: string,
  assignmentId: string,
  item: Assignment
): Promise<
  FailedResponse | { code: string; success: true; message: string }
> => {
  const res = await configuredAxios.delete(
    "/courses/" + classSlug + "/assignment/" + assignmentId
  );
  return res.data;
};

const getGrade = async (
  classSlug: string,
  assignmentId: string
): Promise<
  | FailedResponse
  | { code: string; success: true; message: string; grade: Grade[] }
> => {
  const res = await configuredAxios.get(
    "/courses/" + classSlug + "/assignment/" + assignmentId + "/grade"
  );
  return res.data;
};

const setGradeAssignment = async (
  classSlug: string,
  assignmentId: string,
  body: {
    grade: string;
    studentId: string;
  }
): Promise<
  FailedResponse | { code: string; success: true; message: string }
> => {
  const res = await configuredAxios.post(
    "/courses/" + classSlug + "/assignment/" + assignmentId + "/grade",
    body
  );
  return res.data;
};

const finalizeGrade = async (
  classSlug: string,
  assignmentId: string,
  body: {
    studentId: string;
  }
): Promise<
  FailedResponse | { code: string; success: true; message: string }
> => {
  const res = await configuredAxios.post(
    "/courses/" + classSlug + "/assignment/" + assignmentId + "/finalize",
    body
  );
  return res.data;
};

export const ClassRoomApi = {
  getAllClass,
  createClass,
  getCurrentClassInfo,
  joinClassWithCode,
  inviteUser,
  deleteClass,
  updateClassroom,
  addAssignment,
  updateAssignment,
  deleteAssignment,
};

export const AssignmentGradeAPI = {
  setGradeAssignment,
  getGrade,
  finalizeGrade,
};
