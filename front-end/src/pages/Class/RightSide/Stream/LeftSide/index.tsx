import React from "react";
import { createUseStyles } from "react-jss";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux-toolkit/store";
import { Button } from "@mui/material";

const useStyle = createUseStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  section: {
    border: "0.0625rem solid #dadce0",
    borderRadius: "0.5rem",
    padding: "1rem",
  },
  title: {
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: "1.25rem",
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 20,
  },
});
const StreamLeftSide = () => {
  const classes = useStyle();

  const currentClassRoom = useSelector(
    (state: RootState) => state.classroomReducer.currentClassRoom
  );
  return (
    <div className={classes.container}>
      <div className={classes.section}>
        <h1 className={classes.title}>
          Class Code:{" "}
          <span style={{ fontSize: "1rem" }}>{currentClassRoom?.joinId}</span>
        </h1>
        <div className={classes.buttons}>
          <Button>Copy Link Invite</Button>
        </div>
      </div>
    </div>
  );
};

export default StreamLeftSide;
