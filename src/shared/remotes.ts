import { type Server, createRemotes, loggerMiddleware, remote } from "@rbxts/remo";
import { t } from "@rbxts/t";

import { type RankResults, tRankResults } from "./types";

export const remotes = createRemotes(
	{
		getCentreData: remote<Server>().returns<RankResults>(tRankResults),
		redeemRank: remote<Server, [rank: number]>(t.number),
	},
	loggerMiddleware,
);