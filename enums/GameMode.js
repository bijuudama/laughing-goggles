export var GameMode;
(function (GameMode) {
    GameMode[GameMode["FFA"] = 1] = "FFA";
    GameMode[GameMode["EXP"] = 4] = "EXP";
    GameMode[GameMode["TEAM"] = 5] = "TEAM";
    GameMode[GameMode["PARTY"] = 3] = "PARTY";
    GameMode[GameMode["BATTLE_ROYALE"] = 6] = "BATTLE_ROYALE";
})(GameMode || (GameMode = {}));
