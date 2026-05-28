import React, { useEffect, useState } from "@rbxts/react";

import { remotes } from "shared/remotes";
import { Rank, RankResults } from "shared/types";

import RankItem from "./RankItem";
import LoadingIcon from "./LoadingIcon";

export default function RankList({ children }: React.PropsWithChildren) {
    const [rankList, setRankList] = useState<Rank[]>();

    useEffect(() => {
        remotes.getCentreData.request().then((rankResults: RankResults) => {
            if (rankResults) setRankList(rankResults.ranks);
        });
    }, []);

    return (
        <scrollingframe
            Size={new UDim2(1, 0, 0.704, 0)}
            CanvasSize={new UDim2(0, 0, 0.5, 0)}
            AutomaticCanvasSize={Enum.AutomaticSize.Y}
            BackgroundTransparency={1}
        >
            <uigridlayout CellSize={new UDim2(1, 0, 0.2, 0)} CellPadding={new UDim2(0, 0, 0.02, 0)} />

            {rankList ? 
                rankList.map((rank) => (
                    <RankItem {...rank} />
                )) : 
                <LoadingIcon /> 
            }
        </scrollingframe>
    )
}