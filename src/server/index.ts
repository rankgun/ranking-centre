import { MarketplaceService, Players, LogService } from "@rbxts/services";
import BannerNotify from "@rbxts/banner-notify";

import { remotes } from "shared/remotes";
import { Rank, RankgunInitConfig } from "shared/types";

import { getRanks, setRank, setVerbose } from "./rankgunApi";
import { Telemetry } from "./telemetry";

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

        Telemetry.track("rank_redeem_attempt", { targetRankId: rankId });

        if (MarketplaceService.UserOwnsGamePassAsync(player.UserId, rank.gamepassId) === false) {
            Telemetry.track("gamepass_not_owned", { targetRankId: rankId });
            notifyError(player, "Gamepass not owned", "You don't yet own the required gamepass for this rank.");
        } else {
            try {
                const rankResponse = setRank(player, rankId, workspaceId, apiToken);
                const ranked = rankResponse !== undefined && rankResponse.StatusCode === 200;

                Telemetry.track("rank_result", {
                    targetRankId: rankId,
                    success: ranked,
                    httpStatus: rankResponse ? rankResponse.StatusCode : undefined,
                });

                if (!ranked) {
                    LogService.Warn("[Rankgun] Failed to set rank");
                    if (rankResponse && rankResponse.Body) LogService.Warn("[Rankgun] Response Body", rankResponse.Body);

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
                Telemetry.track("rank_result", { targetRankId: rankId, success: false });
                LogService.Warn(`[Rankgun] Error while ranking user: ${tostring(err)}`);
                notifyError(player, "Internal server error", "We couldn't rank you due to an error. Try again.");
            }
        }
    } else {
        LogService.Warn("[Rankgun] Could not load passes");
        notifyError(player, "Could not load passes", "The server couldn't find the centre's passes");
    }
}

function addClientLoader(player: Player) {
    const clientLoader = script.FindFirstChild("clientLoader")?.Clone();
    if (clientLoader) clientLoader.Parent = player.FindFirstChild("PlayerGui");
}

export function Init({ workspaceId, apiToken, verbose }: RankgunInitConfig) {
    if (verbose) setVerbose(true);

    LogService.Info("[Rankgun] Initialising remote listeners");

    BannerNotify.InitServer();
    Telemetry.init({ workspaceId, apiToken });

    // set up remote listeners
    remotes.getCentreData.onRequest(() => {
        const rankResults = getRanks(workspaceId, apiToken);
        if (rankResults.ranks) {
            ranksCache = rankResults.ranks;
            Telemetry.track("ranks_loaded", { rankCount: rankResults.ranks.size() });
        }

        return rankResults;
    });
    remotes.redeemRank.connect((player, rankId) => redeemRank(player, rankId, workspaceId, apiToken));

    // add the client loader to players when they join
    for (const player of Players.GetPlayers()) addClientLoader(player);
    Players.PlayerAdded.Connect(addClientLoader);
}

