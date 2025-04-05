import { AppBar, Toolbar, IconButton, Typography, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "react-oidc-context";

export const Header = () => {
  const auth = useAuth();

  const handleLogout = async () => {
    try {
      // Clear the local session
      await auth.removeUser();

      // Create the Cognito logout URL with all required parameters
      const logoutUrl = `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/logout?client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
        process.env.NEXT_PUBLIC_COGNITO_REDIRECT as string
      )}&logout_uri=${encodeURIComponent(
        process.env.NEXT_PUBLIC_COGNITO_REDIRECT as string
      )}`;

      // Use replace to avoid opening in a new tab
      window.location.replace(logoutUrl);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Menu Icon */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* App Title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          My Belly&apos;s Diary
        </Typography>

        {/* User Authentication Status */}
        {auth.isLoading && <Typography sx={{ mr: 2 }}>Loading...</Typography>}
        {auth.isAuthenticated ? (
          <>
            <Typography sx={{ mr: 2 }}>
              Oh hai, {auth.user?.profile["cognito:username"] as string}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button color="inherit" onClick={() => auth.signinRedirect()}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};
