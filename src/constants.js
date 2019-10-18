const GAME_WIDTH = 320;
const GAME_HEIGHT = 240;

const GAME_TILE_SIZE = 32;
const GAME_TIME_SIZE_SQ = GAME_TILE_SIZE * GAME_TILE_SIZE;
const INV_GAME_TILE_SIZE = 1 / GAME_TILE_SIZE;

const GameplayConstants = {
  MoveSpeed: 120,
  DashSpeed: 400,
  DashDuration: 120,
  DashToStrikeEarlyWindow: 60,

  StrikeWindup: 80,
  StrikeTime: 108,
  StrikeCooldown: 36,
  StrikeDistance: 24,

  AgitationMax: 100,

  CameraTurnSpeed: 1.87,
  CameraFollowDecay: 0.05
};

const DisplayConstants = {
  CameraDistance: 4,
  CameraHeight: 4,

  TextBipTime: 20,
  EndLineTime: 1000
};

const PlayerStates = {
  NORMAL: 0,
  DASHING: 1,
  STRIKING: 2,
  KNOCKBACK: 3,
  DYING: 4
};