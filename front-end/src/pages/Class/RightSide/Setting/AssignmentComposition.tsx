import { TextField, Typography } from "@mui/material";
import { createUseStyles } from "react-jss";
import AddIcon from "@mui/icons-material/Add";
import { Assignment, ClassRoom } from "../../../../types/Classroom.type";
import { LoadingButton } from "@mui/lab";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import { ClassRoomApi } from "../../../../api/classroom";
import AssignmentMapValue from "./AssignmentMapValue";
import Divider from "@mui/material/Divider";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addAssignment } from "../../../../redux-toolkit/slice/classroom.slice";

const useStyle = createUseStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  header: {
    zIndex: 2,
    padding: "0px 16px",
    background: "white",
    position: "relative",
    width: "fit-content",
    margin: "0px auto",
  },
  body: {
    border: "3px solid gray",
    borderRadius: 16,
    padding: "20px 30px",
    margin: "0px auto",
    marginTop: -29,
    width: "fit-content",
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  bottom: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
  },
});

type Props = {
  currentClassRoom: ClassRoom;
  onChange: (gradesValue: Assignment) => void;
};

const generateNewAssignment = (): Assignment => ({
  _id: uuidv4(),
  name: "",
  point: 0.0,
  createAt: new Date().toString(),
  updateAt: new Date().toString(),
  grades: [],
});
const AssignmentComposition = ({ currentClassRoom, onChange }: Props) => {
  const classes = useStyle();
  const storeDispatch = useDispatch();

  const assignments = currentClassRoom.assignments;

  const [newAssignment, setNewAssignment] = useState<Assignment>(
    generateNewAssignment()
  );
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const handleAddAssignment = async () => {
    if (!currentClassRoom) return;
    try {
      setIsAdding(true);
      const dataRes = await ClassRoomApi.addAssignment(
        currentClassRoom.slug,
        newAssignment
      );
      if (!dataRes.success) {
        toast.error(dataRes.message);
        return;
      }
      storeDispatch(addAssignment(dataRes.assignment));
      toast.success(`Create assignment ${dataRes.assignment.name} success`);
      setNewAssignment(generateNewAssignment());
    } catch (err) {
      console.log(err);
      toast.error("Create assignment failed!");
    } finally {
      setIsAdding(false);
    }
  };
  return (
    <div className={classes.container}>
      <Typography
        component={"h5"}
        variant="h5"
        textAlign={"center"}
        className={classes.header}
      >
        Assignment Setting
      </Typography>
      <div className={classes.body}>
        {assignments.map((item) => (
          <div key={item._id} className={classes.row}>
            <AssignmentMapValue defaultAssignment={item} />
          </div>
        ))}
        <Divider component="div" style={{ width: "100%" }}></Divider>
        <div className={classes.row}>
          <TextField
            variant={"outlined"}
            label={"Name"}
            defaultValue={newAssignment.name}
            value={newAssignment.name}
            onChange={(e) => {
              setNewAssignment((prevItem) => ({
                ...prevItem,
                name: e.target.value,
              }));
            }}
            disabled={isAdding}
          ></TextField>
          <TextField
            variant={"outlined"}
            label={"Composition"}
            value={newAssignment.point}
            onChange={(e) => {
              const floatNumberValue = e.target.value
                .replace(/[^0-9.]/g, "")
                .replace(/(\..*?)\..*/g, "$1");
              setNewAssignment((prevItem) => ({
                ...prevItem,
                point: (floatNumberValue as unknown as number) || 0.0,
              }));
            }}
            disabled={isAdding}
          ></TextField>
          <LoadingButton
            variant="contained"
            color={"primary"}
            startIcon={<AddIcon />}
            onClick={() => handleAddAssignment()}
            loading={isAdding}
          >
            Add
          </LoadingButton>
        </div>
      </div>

      <div className={classes.bottom}>
        <LoadingButton
          loadingIndicator="Updating…"
          variant="contained"
          color={"warning"}
        >
          Update
        </LoadingButton>
      </div>
    </div>
  );
};

export default AssignmentComposition;
