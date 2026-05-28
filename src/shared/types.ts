import { t } from "@rbxts/t";

export type Rank = {
	id: string,
    header: string,
    body: string,
    rankId: number,
    gamepassId: number,

    createdAt: number,
    updatedAt: number,
    gamepassLink: string,
    isActive: boolean
};

export const tRank = t.interface({
	id: t.string,
	header: t.string,
	body: t.string,
	rankId: t.number,
	gamepassId: t.number,

    createdAt: t.number,
    updatedAt: t.number,
    gamepassLink: t.string,
    isActive: t.boolean
});

export type RankResults = {
    success?: boolean, // why is this only returned for failed requests?
    ranks?: Rank[],
    error?: string,
    code?: string,
}

export const tRankResults = t.interface({
    success: t.optional(t.boolean),
    ranks: t.optional(t.array(tRank)),
    error: t.optional(t.string),
    code: t.optional(t.string),
})