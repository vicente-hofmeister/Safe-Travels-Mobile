const { networkInterfaces } = require("os");
const { readFileSync, writeFileSync, existsSync } = require("fs");
const path = require("path");

function getLocalIPv4() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (
        net.family === "IPv4" &&
        !net.internal &&
        !net.address.startsWith("127.") &&
        !net.address.startsWith("172.")
      ) {
        return net.address;
      }
    }
  }
  throw new Error("Não foi possível detectar o IPv4 local. Verifique se está conectado a uma rede.");
}

const envPath = path.join(__dirname, "..", ".env");

if (!existsSync(envPath)) {
  writeFileSync(envPath, `EXPO_PUBLIC_API_URL=http://localhost:3000\n`, "utf8");
}

const ip = getLocalIPv4();
const url = `http://${ip}:3000`;

let content = readFileSync(envPath, "utf8");

if (/^EXPO_PUBLIC_API_URL=.*/m.test(content)) {
  content = content.replace(/^EXPO_PUBLIC_API_URL=.*/m, `EXPO_PUBLIC_API_URL=${url}`);
} else {
  content += `\nEXPO_PUBLIC_API_URL=${url}\n`;
}

writeFileSync(envPath, content, "utf8");
console.log(`✓ EXPO_PUBLIC_API_URL=${url}`);
