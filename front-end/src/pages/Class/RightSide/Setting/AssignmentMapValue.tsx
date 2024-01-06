import { Button, TextField } from "@mui/material";
import React, { useState } from "react";
import { Assignment } from "../../../../types/Classroom.type";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";
import { ClassRoomApi } from "../../../../api/classroom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux-toolkit/store";
import { toast } from "react-toastify";
import {
  deleteAssignment,
  updateAssignment,
} from "../../../../redux-toolkit/slice/classroom.slice";
import { LoadingButton } from "@mui/lab";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { createUseStyles } from "react-jss";

type Props = {
  defaultAssignment: Assignment;
};

const useStyle = createUseStyles({
  buttonRows: {
    display: "flex",
    width: "100%",
    gap: 10,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});

enum BUTTON_MODE {
  IDLE = "IDLE",
  EDITING = "EDITING",
}
const AssignmentMapValue = ({ defaultAssignment }: Props) => {
  const storeDispatch = useDispatch();
  const classes = useStyle();

  const currentClassRoom = useSelector(
    (state: RootState) => state.classroomReducer.currentClassRoom
  );

  const [assignment, setAssignment] = useState<Assignment>(defaultAssignment);
  const [buttonMode, setButtonMode] = useState<BUTTON_MODE>(BUTTON_MODE.IDLE);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const handleUpdateAssignment = async () => {
    try {
      setIsUpdating(true);
      const dataRes = await ClassRoomApi.updateAssignment(
        currentClassRoom.slug,
        assignment._id,
        assignment
      );
      if (!dataRes.success) {
        toast.error(dataRes.message);
        return;
      }
      storeDispatch(updateAssignment(dataRes.assignment));
      toast.success(`Update assignment ${dataRes.assignment.name} success`);
      setButtonMode(BUTTON_MODE.IDLE);
    } catch (err) {
      console.log(err);
      toast.error("Update assignment failed!");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAssignment = async () => {
    try {
      setIsUpdating(true);
      const dataRes = await ClassRoomApi.deleteAssignment(
        currentClassRoom.slug,
        assignment._id,
        assignment
      );
      if (!dataRes.success) {
        toast.error(dataRes.message);
        return;
      }
      toast.success(`Delete assignment ${assignment.name} success`);
      storeDispatch(deleteAssignment(assignment._id));
    } catch (err) {
      console.log(err);
      toast.error("Delete assignment failed!");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <TextField
        variant={"outlined"}
        label={"Name"}
        defaultValue={assignment.name}
        value={assignment.name}
        onChange={(e) => {
          setAssignment((prevItem) => ({
            ...prevItem,
            name: e.target.value,
          }));
        }}
        disabled={isUpdating || buttonMode !== BUTTON_MODE.EDITING}
      ></TextField>
      <TextField
        variant={"outlined"}
        label={"Composition"}
        value={assignment.point}
        onChange={(e) => {
          const floatNumberValue = e.target.value
            .replace(/[^0-9.]/g, "")
            .replace(/(\..*?)\..*/g, "$1");
          setAssignment((prevItem) => ({
            ...prevItem,
            point: (floatNumberValue as unknown as number) || 0.0,
          }));
        }}
        disabled={isUpdating || buttonMode !== BUTTON_MODE.EDITING}
      ></TextField>
      {buttonMode === BUTTON_MODE.EDITING && (
        <>
          <LoadingButton
            variant="contained"
            color={"success"}
            startIcon={<DoneIcon />}
            onClick={handleUpdateAssignment}
            loading={isUpdating}
          >
            Done
          </LoadingButton>
          <div className={classes.buttonRows}>
            <LoadingButton
              variant="contained"
              color={"error"}
              startIcon={<DeleteForeverIcon />}
              onClick={handleDeleteAssignment}
              loading={isUpdating}
            >
              Delete
            </LoadingButton>
            <LoadingButton
              variant="contained"
              color={"warning"}
              onClick={() => {
                setAssignment(defaultAssignment);
                setButtonMode(BUTTON_MODE.IDLE);
              }}
              loading={isUpdating}
            >
              Cancel
            </LoadingButton>
          </div>
        </>
      )}
      {buttonMode === BUTTON_MODE.IDLE && (
        <Button
          variant="contained"
          color={"secondary"}
          startIcon={<EditIcon />}
          onClick={() => setButtonMode(BUTTON_MODE.EDITING)}
        >
          Edit
        </Button>
      )}
    </>
  );
};

export default AssignmentMapValue;
