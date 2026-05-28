import { MarketplaceService, Players } from "@rbxts/services";
import BannerNotify from "@rbxts/banner-notify";

import { remotes } from "shared/remotes";
import { Rank } from "shared/types";

import { getRanks, setRank } from "./rankgunApi";

function notifyError(player: Player, header: string, message: string) {
    BannerNotify.Notify({
        player, header, message,
        icon: "rbxassetid://18576886056",
        duration: 3,
        configs: [ 0.3, Color3.fromHex("#500202"), 0, Color3.fromHex("#FFFFFF") ]
    });
}

let ranksCache: Rank[] = [];

function redeemRank(player: Player, rankId: number, workspaceId: string, apiToken: string) {
    const rankResults = ranksCache.size() > 0 ? ranksCache : (getRanks(workspaceId, apiToken)).ranks;

    if (rankResults) {
        const rank = rankResults.find((r) => r.rankId === rankId);
        if (!rank) {
            notifyError(player, "Could not find rank", "The server couldn't find the rank you requested");
            return;
        }

        if (MarketplaceService.UserOwnsGamePassAsync(player.UserId, rank.gamepassId) === false) {
            notifyError(player, "Gamepass not owned", "You don't yet own the required gamepass for this rank.");
        } else {
            try {
                const rankResponse = setRank(player, rankId, workspaceId, apiToken);
                if (!rankResponse || rankResponse.StatusCode !== 200) {
                    warn(`[Rankgun] Failed to set rank:`);
                    warn(rankResponse);

                    notifyError(player, "Failed to set rank", "We couldn't rank you due to an error. Try again.");
                } else {
                    BannerNotify.Notify({
                        header: "Successfully ranked!",
                        message: `You are now ranked as ${rank.header}.`,
                        icon: "rbxassetid://109887188019909",
                        duration: 3,
                        player
                    });
                }
            } catch (err) {
                warn(`[Rankgun] Error while ranking user:`)
                warn(err);
                notifyError(player, "Internal server error", "We couldn't rank you due to an error. Try again.");
            }
        }
    } else {
        warn(`[Rankgun] Could not load passes`)
        notifyError(player, "Could not load passes", "The server couldn't find the centre's passes");
    }
}

function addClientLoader(player: Player) {
    const clientLoader = script.FindFirstChild("clientLoader")?.Clone();
    if (clientLoader) clientLoader.Parent = player.FindFirstChild("PlayerGui");
}

export function Init({ workspaceId, apiToken }: { workspaceId: string, apiToken: string }) {
    print("[Rankgun] Initialising remote listeners");

    BannerNotify.InitServer();

    // set up remote listeners
    remotes.getCentreData.onRequest(() => { 
        const rankResults = getRanks(workspaceId, apiToken);
        if (rankResults.ranks) ranksCache = rankResults.ranks;

        return rankResults;
    });
    remotes.redeemRank.connect((player, rankId) => redeemRank(player, rankId, workspaceId, apiToken));

    // add the client loader to players when they join
    for (const player of Players.GetPlayers()) addClientLoader(player);
    Players.PlayerAdded.Connect(addClientLoader);
}

