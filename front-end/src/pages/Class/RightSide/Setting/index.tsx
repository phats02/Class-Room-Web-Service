import { TextField } from "@mui/material";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import AssignmentComposition from "./AssignmentComposition";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux-toolkit/store";
import { Assignment as TAssignment } from "../../../../types/Classroom.type";

const useStyle = createUseStyles({
  container: {
    maxWidth: 1000,
    margin: "0px auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
});

const ClassRoomSetting = () => {
  const classes = useStyle();

  const currentClassRoom = useSelector(
    (state: RootState) => state.classroomReducer.currentClassRoom
  );

  const [name, setName] = useState<string>(currentClassRoom?.name || "");
  const [description, setDescription] = useState<string>(
    currentClassRoom?.description || ""
  );
  const [assignment, setAssignment] = useState<TAssignment>();

  return (
    <div className={classes.container}>
      <TextField
        id="class-name"
        label="Class name"
        variant="outlined"
        fullWidth
        defaultValue={currentClassRoom?.name}
        value={name}
        onChange={(e) => {
          setName(e.currentTarget.value);
        }}
      />
      <TextField
        id="class-desc"
        label="Description"
        multiline
        maxRows={4}
        defaultValue={currentClassRoom?.description}
        value={description}
        onChange={(e) => {
          setDescription(e.currentTarget.value);
        }}
      />
      <AssignmentComposition
        currentClassRoom={currentClassRoom}
        onChange={(value) => {
          setAssignment(value);
        }}
      />
    </div>
  );
};

export default ClassRoomSetting;
