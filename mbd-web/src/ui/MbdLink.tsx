import React from "react";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import MuiLink, { LinkProps as MuiLinkProps } from "@mui/material/Link";
import { forwardRef } from "react";

// Define the props type by combining Next.js LinkProps and MUI LinkProps
type MbdLinkProps = Omit<MuiLinkProps, "href"> &
  Pick<NextLinkProps, "href" | "as">;

const MbdLink = forwardRef<HTMLAnchorElement, MbdLinkProps>(
  function MbdLink(props, ref) {
    const { href, as, ...other } = props;

    return (
      <NextLink href={href} as={as} passHref>
        <MuiLink ref={ref} {...other} />
      </NextLink>
    );
  }
);

export default MbdLink;
