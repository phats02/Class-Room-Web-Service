import { Box, Button, CardContent, Typography } from "@mui/material";
import React from "react";
import { ClassRoom } from "../../../types/Classroom.type";
import { generateLinkInvite } from "../../../utils/common";

type Props = {
  currentClassRoom: ClassRoom;
};

const LeftSide = ({ currentClassRoom }: Props) => {
  function CopyCode() {
    navigator.clipboard.writeText(currentClassRoom?.joinId as any);
  }
  function CopyLinkInvite() {
    const invitationLink = generateLinkInvite(currentClassRoom?.joinId as any);
    navigator.clipboard.writeText(invitationLink);
  }
  return (
    <Box
      sx={{
        flex: "15%",
        height: "90vh",
        borderRight: 1,
        borderColor: "grey.300",
      }}
    >
      <CardContent>
        <Typography
          gutterBottom
          variant="h5"
          component="div"
          sx={{ fontWeight: "bold" }}
        >
          {currentClassRoom?.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {currentClassRoom?.description}
        </Typography>
      </CardContent>

      <Box
        sx={{
          maxWidth: 250,
          border: 1,
          borderColor: "grey.300",
          borderRadius: 2,
          mt: 2,
          ml: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            pl: 2,
            fontWeight: "bold",
            backgroundImage: "linear-gradient(to right, #46b5e5, #1e88e5)",
            pt: 1,
            color: "white",
            pb: 1,
          }}
        >
          Invite Code
        </Typography>
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            pt: 2,
            fontWeight: "bold",
          }}
        >
          {currentClassRoom?.joinId}
        </Typography>
        <Box sx={{ display: "flex" }}>
          <Button
            onClick={CopyCode}
            size="small"
            color="primary"
            sx={{
              ml: "auto",
              mr: 3,
              mb: 1,
              mt: 1,
            }}
          >
            copy code
          </Button>
          <Button
            size="small"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              CopyLinkInvite();
            }}
          >
            Copy link invite
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LeftSide;
