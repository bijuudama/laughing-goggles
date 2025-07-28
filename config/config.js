const config = {
    bots: [],
    maxBots: 10,
    botName: [
      "EvoBots", ...Array(2500).fill("♣ ☠ Ɱóʙ𝕀๔ ♣💖")
    ], // 1 - 9999
    serverSettings: {
      port: 80,
      useSSL: false,
    },
    proxySettings: {
      scrape: false,
      timeout: 7000,
      protocol: "http",
      enableProxy: false,
    },
  };
  export default config;