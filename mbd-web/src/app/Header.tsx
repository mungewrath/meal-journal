// "use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "react-oidc-context";
// import { useSession, signIn, signOut } from "next-auth/react";

export default function Header() {
  // const { data: session } = useSession();
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
        {/* {session ? (
          <>
            Signed in as {session?.user?.email} <br />
            <button onClick={() => signOut()}>Sign out</button>
          </>
        ) : (
          <>
            Not signed in <br />
            <button onClick={() => signIn()}>Sign in</button>
          </>
        )} */}
        {auth.isAuthenticated && (
          <>
            Oh hai {auth.user?.profile["cognito:username"]}
            <Button color="inherit">Logout</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
