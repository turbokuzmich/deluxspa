import Link from "next/link";
import LoginIcon from "@mui/icons-material/Login";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import IconButton from "@mui/material/IconButton";
import { useSelector } from "react-redux";
import { AuthState, getAuthState } from "../store/slices/auth";

export default function AuthLink() {
  const authState = useSelector(getAuthState);

  return authState === AuthState.authorized ? (
    <Link href="/profile" passHref>
      <IconButton component="a">
        <PermIdentityIcon />
      </IconButton>
    </Link>
  ) : (
    <Link href="/auth" passHref>
      <IconButton component="a">
        <LoginIcon />
      </IconButton>
    </Link>
  );
}
