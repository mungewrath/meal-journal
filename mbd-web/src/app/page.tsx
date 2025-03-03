import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import { Counter } from "@/ui/Counter";

export default function Home() {
  return (
    <div>
      <main>
        <Container maxWidth="lg">
          <Box
            sx={{
              my: 4,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
              My Belly&apos;s Diary
            </Typography>
            <Link href="/link" color="secondary" component={NextLink}>
              Test link
            </Link>
          </Box>
          <Box>
            <Counter />
          </Box>
        </Container>
      </main>
      <footer></footer>
    </div>
  );
}
