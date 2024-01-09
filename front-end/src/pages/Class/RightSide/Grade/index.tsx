import {
  DataGrid,
  GridCellEditStopParams,
  GridCellEditStopReasons,
  GridCellParams,
  GridColDef,
} from "@mui/x-data-grid";
import { Box, Button, IconButton, Popover } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux-toolkit/store";
import { Assignment } from "../../../../types/Classroom.type";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import { toast } from "react-toastify";
import { AssignmentGradeAPI } from "../../../../api/classroom";
import { updateGrade } from "../../../../redux-toolkit/slice/classroom.slice";

const useStyle = createUseStyles({
  finalizedItem: {
    color: "green",
    fontSize: 20,
    fontWeight: 900,
  },
});

type PopoverButtonProps = {
  params: GridCellParams<any>;
};
const PopoverButton = ({ params }: PopoverButtonProps) => {
  const storeDispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const currentClassRoom = useSelector(
    (item: RootState) => item.classroomReducer.currentClassRoom
  );

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMakeFinalizeData = async () => {
    try {
      const assignmentId = params.field;
      const classSlug = currentClassRoom.slug;
      const data = await AssignmentGradeAPI.finalizeGrade(
        classSlug,
        assignmentId,
        { studentId: params.id as string }
      );
      if (!data.success) {
        toast.error(data.message);
        return;
      }
      const updatedGrade = await AssignmentGradeAPI.getGrade(
        classSlug,
        assignmentId
      );
      if (updatedGrade.success)
        storeDispatch(
          updateGrade({
            assignmentId,
            grades: updatedGrade.grade,
          })
        );
    } catch (err) {
      console.log("🚀 ~ file: index.tsx:103 ~ handelEditCellStop ~ err:", err);
      toast.error("Send request update grade point failed!");
    }
  };

  const open = Boolean(anchorEl);
  return (
    <div>
      <IconButton onClick={handleClick}>
        <MoreVertIcon></MoreVertIcon>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Button
          onClick={() => {
            handleMakeFinalizeData();
          }}
        >
          Make finalized
        </Button>
      </Popover>
    </div>
  );
};

const generateColumns = (
  assignments: Assignment[],
  finalizedItemClassName: string
): GridColDef[] => {
  return [
    { field: "id", headerName: "Student Id", width: 90 },
    ...assignments.map((item) => ({
      field: item._id,
      headerName: item.name + "-" + item.point,
      type: "number",
      editable: true,
      renderCell: (params: GridCellParams<any>) => {
        const element = item.grades.find((item) => item.id === params.id);
        return (
          <>
            <span
              className={
                element && !element.draft ? finalizedItemClassName : ""
              }
            >
              {(params.value as string) || 0}
            </span>
            <PopoverButton params={params} />
          </>
        );
      },
    })),
  ];
};

const generateRows = (assignments: Assignment[]) => {
  let rowList: any[] = [];
  assignments.forEach((item) => {
    rowList = rowList.concat(
      _.flatten(
        item.grades.map((grade) => ({
          id: grade.id,
          [item._id]: grade.grade,
        }))
      )
    );
  });
  return _(rowList)
    .groupBy("id")
    .map((objs) =>
      _.assignWith({}, ...objs, (val1: any, val2: any) => val1 || val2)
    )
    .value();
};
const Grade = () => {
  const storeDispatch = useDispatch();

  const currentClassRoom = useSelector(
    (item: RootState) => item.classroomReducer.currentClassRoom
  );

  const classes = useStyle();
  const assignments = useMemo(
    () => currentClassRoom?.assignments || [],
    [currentClassRoom]
  );

  const handelEditCellStop = async (
    params: GridCellEditStopParams,
    event: any
  ) => {
    try {
      if (params.reason === GridCellEditStopReasons.cellFocusOut) {
        event.defaultMuiPrevented = true;
        return;
      }
      const assignmentId = params.field;
      const classSlug = currentClassRoom.slug;
      const data = await AssignmentGradeAPI.setGradeAssignment(
        classSlug,
        assignmentId,
        {
          grade: event.target.value as string,
          studentId: params.id as string,
        }
      );
      if (!data.success) {
        toast.error(data.message);
        return;
      }
      const updatedGrade = await AssignmentGradeAPI.getGrade(
        classSlug,
        assignmentId
      );
      if (updatedGrade.success)
        storeDispatch(
          updateGrade({
            assignmentId,
            grades: updatedGrade.grade,
          })
        );
    } catch (err) {
      console.log("🚀 ~ file: index.tsx:103 ~ handelEditCellStop ~ err:", err);
      toast.error("Send request update grade point failed!");
    }
  };

  const rows = useMemo(() => generateRows(assignments) as any, [assignments]);
  const columns = useMemo(
    () => generateColumns(assignments, classes.finalizedItem),
    [assignments]
  );

  useEffect(() => {
    console.log("🚀 ~ file: index.tsx:213 ~ Grade ~ columns:", columns);
  }, [assignments]);

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        onCellEditStop={handelEditCellStop}
      />
    </Box>
  );
};

export default Grade;
