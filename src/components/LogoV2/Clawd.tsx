import { c as _c } from "react/compiler-runtime";
import * as React from 'react';
import { Box, Text } from '../../ink.js';
import { env } from '../../utils/env.js';
export type ClawdPose = 'default' | 'arms-up'
| 'look-left'
| 'look-right';

type Props = {
  pose?: ClawdPose;
};

// lelecode logo mascot — "lele" rendered as 3-row block art
//
//  Row 1:  █  ▀▀ █  ▀▀
//  Row 2:  █  █▀ █  █▀
//  Row 3:  ▀▀ ▄▄ ▀▀ ▄▄
//
// Pose only affects color/brightness — shape stays constant.

// The three rows of the "lele" block logo
const ROW1 = '█  ▀▀ █  ▀▀';
const ROW2 = '█  █▀ █  █▀';
const ROW3 = '▀▀ ▄▄ ▀▀ ▄▄';

// For animated pose: dim the logo slightly when looking around,
// brighten on arms-up (jump).
function colorForPose(pose: ClawdPose): string {
  switch (pose) {
    case 'arms-up': return 'clawd_body';
    case 'look-left':
    case 'look-right': return 'clawd_body';
    default: return 'clawd_body';
  }
}

export function Clawd(t0) {
  const $ = _c(14);
  let t1;
  if ($[0] !== t0) {
    t1 = t0 === undefined ? {} : t0;
    $[0] = t0;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const { pose: t2 } = t1;
  const pose = t2 === undefined ? "default" : t2;

  const col = colorForPose(pose);
  const dimmed = pose === 'look-left' || pose === 'look-right';

  let row1;
  if ($[3] !== col) {
    row1 = <Text color={col} dimColor={dimmed}>{ROW1}</Text>;
    $[3] = col;
    $[4] = row1;
  } else {
    row1 = $[4];
  }

  let row2;
  if ($[5] !== col) {
    row2 = <Text color={col} dimColor={dimmed}>{ROW2}</Text>;
    $[5] = col;
    $[6] = row2;
  } else {
    row2 = $[6];
  }

  let row3;
  if ($[7] !== col) {
    row3 = <Text color={col} dimColor={dimmed}>{ROW3}</Text>;
    $[7] = col;
    $[8] = row3;
  } else {
    row3 = $[8];
  }

  let result;
  if ($[9] !== row1 || $[10] !== row2 || $[11] !== row3) {
    result = <Box flexDirection="column">{row1}{row2}{row3}</Box>;
    $[9] = row1;
    $[10] = row2;
    $[11] = row3;
    $[12] = result;
  } else {
    result = $[12];
  }
  return result;
}

function AppleTerminalClawd(t0) {
  const $ = _c(6);
  const { pose } = t0;
  const dimmed = pose === 'look-left' || pose === 'look-right';

  let row1;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    row1 = <Text color="clawd_body">{ROW1}</Text>;
    $[0] = row1;
  } else {
    row1 = $[0];
  }

  let row2;
  if ($[1] !== dimmed) {
    row2 = <Text color="clawd_body" dimColor={dimmed}>{ROW2}</Text>;
    $[1] = dimmed;
    $[2] = row2;
  } else {
    row2 = $[2];
  }

  let row3;
  if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
    row3 = <Text color="clawd_body">{ROW3}</Text>;
    $[3] = row3;
  } else {
    row3 = $[3];
  }

  let result;
  if ($[4] !== row2) {
    result = <Box flexDirection="column">{row1}{row2}{row3}</Box>;
    $[4] = row2;
    $[5] = result;
  } else {
    result = $[5];
  }
  return result;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozfQ==
