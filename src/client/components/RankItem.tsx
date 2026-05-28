import React, { useEffect, useState } from "@rbxts/react";
import { MarketplaceService, Players } from "@rbxts/services";

import { Rank } from "shared/types";
import { remotes } from "shared/remotes";

import Text from "./Text";

export default function RankItem({ id, header, body, rankId, gamepassId }: Rank) {
    const [rankImageId, setRankImageId] = useState<number>();
    const [rankPrice, setRankPrice] = useState<number | string>("...");

    // yielding async call, so it's a useEffect to prevent blocking renders
    useEffect(() => {
        const passInfo = MarketplaceService.GetProductInfoAsync(gamepassId, Enum.InfoType.GamePass) as {
            IconImageAssetId?: number;
            PriceInRobux?: number;
        };

        if (passInfo) {
            if (passInfo.IconImageAssetId) setRankImageId(passInfo.IconImageAssetId);
            if (passInfo.PriceInRobux) setRankPrice(passInfo.PriceInRobux);
        }
    }, []);

    const redeemRank = () => remotes.redeemRank.fire(rankId);

    return (
        <frame BackgroundColor3={new Color3(1, 1, 1)} BackgroundTransparency={0.95}>
            <uicorner CornerRadius={new UDim(0.1, 0)} />
            <uipadding 
                PaddingTop={new UDim(0.03, 0)}
                PaddingBottom={new UDim(0.03, 0)}
                PaddingLeft={new UDim(0.03, 0)}
                PaddingRight={new UDim(0.03, 0)}
            />
            <uilistlayout 
                Padding={new UDim(0.02, 0)} 
                FillDirection={Enum.FillDirection.Horizontal}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />

            <imagelabel
                Image={rankImageId ? `rbxassetid://${rankImageId}` : "rbxasset://textures/ui/GuiImagePlaceholder.png"}
                ImageTransparency={rankImageId ? 0 : 1}
                Size={new UDim2(0.064, 0, 0.741, 0)}
                LayoutOrder={1}
            >
                <uicorner CornerRadius={new UDim(1, 0)} />
                <uiaspectratioconstraint 
                    AspectRatio={1} 
                    AspectType={Enum.AspectType.ScaleWithParentSize} 
                    DominantAxis={Enum.DominantAxis.Height}
                />
            </imagelabel>

            <frame Size={new UDim2(0.774, 0, 1, 0)} BackgroundTransparency={1} LayoutOrder={2}>
                <uipadding PaddingTop={new UDim(0.1, 0)} PaddingBottom={new UDim(0.1, 0)} PaddingLeft={new UDim(0.02, 0)} />
                <uiflexitem FlexMode={Enum.UIFlexMode.Shrink} />

                <Text 
                    Text={header}
                    Position={new UDim2(0, 0, 0.025, 0)}
                    Size={new UDim2(1, 0, 0.536, 0)}
                />
                <Text 
                    Text={body}
                    TextTransparency={0.5}
                    Position={new UDim2(0, 0, 0.61, 0)}
                    Size={new UDim2(1, 0, 0.318, 0)}
                />
            </frame>

            <textbutton
                Event={{
					MouseButton1Click: redeemRank
				}}
                BackgroundColor3={Color3.fromHex("#3D5EFF")} 
                Size={new UDim2(0.114, 0, 0.55, 0)} 
                Text=""
            >
                <uicorner CornerRadius={new UDim(0.25, 0)} />
                <uipadding PaddingTop={new UDim(0.2, 0)} PaddingBottom={new UDim(0.2, 0)} />

                <Text
                    Text={`Redeem`}
                    TextXAlignment={Enum.TextXAlignment.Center}
                    Size={new UDim2(1, 0, 1, 0)}
                />
            </textbutton>

            <textbutton
                Event={{
					MouseButton1Click: () =>
						MarketplaceService.PromptGamePassPurchase(Players.LocalPlayer, gamepassId)
				}}
                BackgroundColor3={Color3.fromHex("#3D5EFF")} 
                Size={new UDim2(0.114, 0, 0.55, 0)} 
                Text=""
            >
                <uicorner CornerRadius={new UDim(0.25, 0)} />
                <uipadding PaddingTop={new UDim(0.2, 0)} PaddingBottom={new UDim(0.2, 0)} />

                <Text
                    Text={` ${rankPrice}`}
                    TextXAlignment={Enum.TextXAlignment.Center}
                    Size={new UDim2(1, 0, 1, 0)}
                />
            </textbutton>
        </frame>
    )
}