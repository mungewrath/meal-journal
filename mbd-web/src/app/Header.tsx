// "use client";

import { AppBar, Toolbar, IconButton, Typography, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "react-oidc-context";

export const Header = () => {
  const auth = useAuth();
    
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          My Belly&apos;s Diary
        </Typography>
        {auth.isAuthenticated && (
          <>
            Oh hai {auth.user?.profile["cognito:username"]}
            <Button color="inherit">Logout</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};
