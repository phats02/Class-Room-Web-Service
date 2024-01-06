import { useEffect } from "react";
import Box from "@mui/material/Box";
import { useState } from "react";
import AddClassmate from "../Common/AddClassmate";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux-toolkit/store";
import { ClassRoomApi, ClassRoomRole } from "../../api/classroom";
import {
  deleteClass,
  setCurrentClass,
} from "../../redux-toolkit/slice/classroom.slice";
import { toast } from "react-toastify";
import { createUseStyles } from "react-jss";
import DeleteClassModal from "../Common/DeleteClassModal";
import RightSide from "./RightSide";

const useStyle = createUseStyles({
  buttons: {
    display: "flex",
    justifyContent: "center",
  },
});

const ClassRoom = () => {
  const { classId } = useParams();
  const classes = useStyle();
  const storeDispatch = useDispatch();
  const currentClassRoom = useSelector(
    (state: RootState) => state.classroomReducer.currentClassRoom
  );
  const currentUser = useSelector(
    (state: RootState) => state.userReducer.currentUser
  );
  const isOwner = currentClassRoom?.owner._id === currentUser?._id;
  const navigate = useNavigate();

  const [openAddClassmate, setOpenAddClassmate] = useState<boolean>(false);
  const [addUserRole, setAddUserRole] = useState<ClassRoomRole>(
    ClassRoomRole.STUDENT
  );
  const [openDeleteClassModal, setOpenDeleteClassModal] =
    useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleInviteUser = async (email: string) => {
    try {
      const res = await ClassRoomApi.inviteUser({
        courseId: currentClassRoom?._id as any,
        email,
        type: addUserRole,
      });
      if (!res?.success) throw res?.message || "Cannot send your request";

      toast.success("Sended invitation link to " + email);
      setOpenAddClassmate(false);
    } catch (err) {
      toast.warning(err as any);
    }
  };

  const handleDeleteClass = async () => {
    try {
      setOpenDeleteClassModal(false);
      setIsDeleting(true);
      const res = await ClassRoomApi.deleteClass(currentClassRoom?._id as any);
      if (!res?.success) throw res?.message || "Cannot send your request";
      toast.success(`Delete class ${currentClassRoom?.name} successfully`);
      storeDispatch(deleteClass(currentClassRoom?._id as any));
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.warning(error as string);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const _fetchCurrentClassRoom = async (id: string) => {
      try {
        const res = await ClassRoomApi.getCurrentClassInfo(id);
        if (!res?.success) {
          throw res?.message || "Cannot send your request";
        }
        storeDispatch(setCurrentClass(res.course));
      } catch (error) {
        toast.warning("Your request fail with error:" + error);
      }
    };

    if (currentClassRoom === null || currentClassRoom._id !== classId)
      _fetchCurrentClassRoom(classId as any);
  }, []);

  return (
    <>
      <Box sx={{ display: "flex", maxWidth: "100%", width: "100vw" }}>
        {/* <LeftSide currentClassRoom={currentClassRoom as any} /> */}
        <RightSide />
      </Box>
      {openAddClassmate && (
        <AddClassmate
          isOpen={openAddClassmate}
          handleClose={() => {
            setOpenAddClassmate(false);
          }}
          handleInviteUser={handleInviteUser}
        />
      )}
      {openDeleteClassModal && (
        <DeleteClassModal
          isOpen={openDeleteClassModal}
          handleClose={() => {
            setOpenDeleteClassModal(false);
          }}
          handleDelete={handleDeleteClass}
        ></DeleteClassModal>
      )}
    </>
  );
};

export default ClassRoom;
