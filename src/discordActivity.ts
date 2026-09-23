import { DiscordSDK } from "@discord/embedded-app-sdk";

let sdk: DiscordSDK | null = null;

function isEmbeddedDiscordActivity() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export async function setupDiscordActivity() {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID?.trim();

  if (!clientId) {
    console.warn("[Discord Activity] VITE_DISCORD_CLIENT_ID is not configured.");
    return null;
  }

  if (!isEmbeddedDiscordActivity()) {
    console.info("[Discord Activity] Browser mode detected; skipping Discord handshake.");
    return null;
  }

  try {
    sdk = new DiscordSDK(clientId);
    await sdk.ready();

    document.documentElement.dataset.discordActivity = "ready";
    window.dispatchEvent(
      new CustomEvent("maryjane:discord-ready", {
        detail: {
          clientId,
          instanceId: sdk.instanceId,
          channelId: sdk.channelId,
          guildId: sdk.guildId,
        },
      }),
    );

    console.info("[Discord Activity] SDK ready.");
    return sdk;
  } catch (error) {
    document.documentElement.dataset.discordActivity = "error";
    console.error("[Discord Activity] SDK handshake failed.", error);
    return null;
  }
}

export function getDiscordSdk() {
  return sdk;
}
