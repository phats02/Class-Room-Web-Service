import React from "react";
import { createUseStyles } from "react-jss";
import { Assignment } from "../../../../../types/Classroom.type";
import { Divider } from "@mui/material";

const useStyle = createUseStyles({
  header: {
    fontWeight: 400,
    fontSize: "1.5rem",
  },
});

type Props = {
  assignment: Assignment;
};

const AssignmentSection = ({ assignment }: Props) => {
  const classes = useStyle();
  return (
    <div>
      <div className={classes.header}>{assignment.name}</div>
      <Divider style={{ borderBottomWidth: 3 }}></Divider>
    </div>
  );
};

export default AssignmentSection;
