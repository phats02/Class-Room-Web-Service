import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { Link, Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Alert, Cross } from "../Common/Sign";
import { ClassRoomApi } from "../../api/classroom";
import { useDispatch } from "react-redux";

enum VerifyResult {
  VERIFYING = "VERIFYING",
  SUCCESS = "SUCCESS",
  FAIL = "FAIL",
}

const useStyle = createUseStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "12%",
  },
  text: {
    color: "white",
    textDecoration: "none",
  },
  buttonLogin: {
    marginTop: "20px",
  },
});

const ALREADY_JOIN_MESSAGE = [
  "Already a teacher",
  "You have already joined this course",
];

const JoinClass = () => {
  const classes = useStyle();
  const storeDispatch = useDispatch();
  const { classCode } = useParams();
  const [verifyResult, setVerifyResult] = useState<VerifyResult>(
    VerifyResult.SUCCESS
  );
  const [failMessage, setFailMessage] = useState<string>("");

  useEffect(() => {
    const verifyCode = async () => {
      const code = classCode;
      if (!code) {
        setVerifyResult(VerifyResult.FAIL);
        return;
      }
      try {
        setVerifyResult(VerifyResult.VERIFYING);
        const res = await ClassRoomApi.joinClassWithCode(code);
        if (!res?.success) {
          if (ALREADY_JOIN_MESSAGE.includes(res.message as any)) {
            toast.success("Joined class with code " + code + " successfully");
            setVerifyResult(VerifyResult.SUCCESS);
            return;
          }
          if (!res.success) throw res.message || "Cannot send your request";
        }
        toast.success("Joined class with " + code + " successfully");
        setVerifyResult(VerifyResult.SUCCESS);
      } catch (err) {
        setVerifyResult(VerifyResult.FAIL);
        setFailMessage(err as string);
      }
    };
    verifyCode();
  }, []);
  return (
    <>
      <Box className={classes.container}>
        {verifyResult === VerifyResult.VERIFYING && <Alert />}
        {verifyResult === VerifyResult.FAIL && <Cross />}
        <Typography variant="h4" component="h4">
          {verifyResult}
        </Typography>
        {verifyResult === VerifyResult.VERIFYING && (
          <Typography>Checking your join request</Typography>
        )}
        {verifyResult === VerifyResult.SUCCESS && (
          <Navigate to={"/home"}></Navigate>
        )}
        {verifyResult === VerifyResult.FAIL && (
          <Typography>Email verification failed</Typography>
        )}
        <Button className={classes.buttonLogin} variant="contained">
          <Link className={classes.text} to={"/login"}>
            Back to Login
          </Link>
        </Button>
      </Box>
    </>
  );
};

export default JoinClass;
