"use client";

import { useState } from "react";
import { Box, Button, Typography, TextField } from "@mui/material";

import {
  decrement,
  increment,
  incrementAsync,
  incrementByAmount,
  incrementIfOdd,
  selectCount,
  selectStatus,
} from "@/lib/features/example/exampleSlice";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";

export const Counter = () => {
  const dispatch = useAppDispatch();
  const count = useAppSelector(selectCount);
  const status = useAppSelector(selectStatus);
  const [incrementAmount, setIncrementAmount] = useState("2");

  const incrementValue = Number(incrementAmount) || 0;

  return (
    <Box sx={{ "& button": { m: 1 } }}>
      <div>
        <Button
          variant="outlined"
          size="small"
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        >
          -
        </Button>
        <Typography component="paragraph" aria-label="Count">
          {count}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        >
          +
        </Button>
      </div>
      <Box>
        <TextField
          size="small"
          aria-label="Set increment amount"
          value={incrementAmount}
          type="number"
          onChange={(e) => {
            setIncrementAmount(e.target.value);
          }}
        />
        <Button
          variant="contained"
          onClick={() => dispatch(incrementByAmount(incrementValue))}
        >
          Add Amount
        </Button>
        <Button
          variant="contained"
          disabled={status !== "idle"}
          onClick={() => dispatch(incrementAsync(incrementValue))}
        >
          Add Async
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            dispatch(incrementIfOdd(incrementValue));
          }}
        >
          Add If Odd
        </Button>
      </Box>
    </Box>
  );
};
