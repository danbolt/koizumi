const GAME_WIDTH = 320;
const GAME_HEIGHT = 240;

const GameplayConstants = {
  MoveSpeed: 70,
  DashSpeed: 400,
  DashDuration: 120,
  DashToStrikeEarlyWindow: 60,

  StrikeWindup: 80,
  StrikeTime: 108,
  StrikeCooldown: 36
};

const PlayerStates = {
  NORMAL: 0,
  DASHING: 1,
  STRIKING: 2,
  KNOCKBACK: 3,
  DYING: 4
};