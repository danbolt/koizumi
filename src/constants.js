const GAME_WIDTH = 320;
const GAME_HEIGHT = 240;

const GAME_TILE_SIZE = 32;
const INV_GAME_TILE_SIZE = 1 / GAME_TILE_SIZE;

const GameplayConstants = {
  MoveSpeed: 70,
  DashSpeed: 400,
  DashDuration: 120,
  DashToStrikeEarlyWindow: 60,

  StrikeWindup: 80,
  StrikeTime: 108,
  StrikeCooldown: 36,
  StrikeDistance: 24,

  AgitationMax: 100,

  CameraTurnSpeed: 1.87
};

const DisplayConstants = {
  CameraDistance: 4,
  CameraHeight: 4
};

const PlayerStates = {
  NORMAL: 0,
  DASHING: 1,
  STRIKING: 2,
  KNOCKBACK: 3,
  DYING: 4
};