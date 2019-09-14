const GAME_WIDTH = 320;
const GAME_HEIGHT = 240;

const GameplayConstants = {
  MoveSpeed: 70,
  DashSpeed: 400,
  DashDuration: 111,
};

const PlayerStates = {
  NORMAL: 0,
  DASHING: 1,
  STRIKING: 2,
  KNOCKBACK: 3,
  DYING: 4
};