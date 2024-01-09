import { Assignment, Grade } from "./../../types/Classroom.type";
import { ClassRoom } from "../../types/Classroom.type";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ClassRoomApi } from "../../api/classroom";
import _ from "lodash";

type ClassRoomSlice = {
  listClassRoom: ClassRoom[];
  currentClassRoom: ClassRoom;
};
const initialState: ClassRoomSlice = {
  listClassRoom: null as unknown as ClassRoom[],
  currentClassRoom: null as unknown as ClassRoom,
};

export const fetchListClassRoom = createAsyncThunk(
  "classroom/fetchListClassRoom",
  async () => {
    const res = await ClassRoomApi.getAllClass();
    return res.courses;
  }
);
const ClassroomSlice = createSlice({
  name: "classroom",
  initialState: initialState,
  reducers: {
    setListClassRoom: (
      state,
      action: PayloadAction<{ listClassRoom: ClassRoom[] }>
    ) => {
      const { listClassRoom } = action.payload;
      state.listClassRoom = listClassRoom;
    },
    addClass: (state, action: PayloadAction<ClassRoom>) => {
      state.listClassRoom = _.uniqBy(
        [action.payload, ...(state.listClassRoom as any)],
        "_id"
      );
    },
    setCurrentClass: (state, action: PayloadAction<ClassRoom>) => {
      state.currentClassRoom = action.payload;
    },
    deleteClass: (state, action: PayloadAction<String>) => {
      const classId = action.payload;
      state.listClassRoom =
        state.listClassRoom?.filter((item) => item._id !== classId) || null;
    },
    addAssignment: (state, action: PayloadAction<Assignment>) => {
      const assignment = action.payload;
      state.currentClassRoom.assignments = [
        ...state.currentClassRoom.assignments,
        assignment,
      ];
    },
    updateAssignment: (state, action: PayloadAction<Assignment>) => {
      const assignment = action.payload;
      state.currentClassRoom.assignments = _.uniqBy(
        [...state.currentClassRoom.assignments, assignment],
        "_id"
      );
    },
    deleteAssignment: (state, action: PayloadAction<string>) => {
      const assignmentId = action.payload;
      state.currentClassRoom.assignments =
        state.currentClassRoom.assignments.filter(
          (item) => item._id !== assignmentId
        );
    },
    updateGrade: (
      state,
      action: PayloadAction<{ assignmentId: string; grades: Grade[] }>
    ) => {
      const { assignmentId, grades } = action.payload;
      state.currentClassRoom.assignments =
        state.currentClassRoom.assignments.map((item) =>
          item._id === assignmentId
            ? {
                ...item,
                grades: grades,
              }
            : item
        );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchListClassRoom.fulfilled, (state, action) => {
      state.listClassRoom = action.payload;
    });
  },
});

export const classroomReducer = ClassroomSlice.reducer;
export const {
  setListClassRoom,
  addClass,
  setCurrentClass,
  deleteClass,
  addAssignment,
  updateAssignment,
  deleteAssignment,
  updateGrade,
} = ClassroomSlice.actions;
