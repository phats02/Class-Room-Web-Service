import React from "react";
import { createUseStyles } from "react-jss";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux-toolkit/store";
import AssignmentSection from "./AssignmentSection";
const useStyle = createUseStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
});
const StreamRightSide = () => {
  const classes = useStyle();
  const currentClassRoom = useSelector(
    (state: RootState) => state.classroomReducer.currentClassRoom
  );
  return (
    <div className={classes.container}>
      {currentClassRoom?.assignments.map((item) => (
        <AssignmentSection key={item._id} assignment={item} />
      ))}
    </div>
  );
};

export default StreamRightSide;
