import "@rbxts-js/react";
import React, { StrictMode } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players, StarterGui } from "@rbxts/services";
import BannerNotify from "@rbxts/banner-notify";

import Layout from "./components/Layout";
import TitleBar from "./components/TitleBar";
import RankList from "./components/RankList";

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui");
const root = createRoot(new Instance("Folder"));

const CentreGui = () => {
    return (
        <screengui IgnoreGuiInset={true} ZIndexBehavior={"Sibling"}>
            <Layout>
                <TitleBar title="Select a rank to purchase" subtitle="Ranking Centre" />
                <RankList />
            </Layout>
        </screengui>
    )
}

function DisableGui() {
    task.spawn(() => {
        let success = false;
        while (success === false) {
            try {
                StarterGui.SetCoreGuiEnabled("All", false);
                StarterGui.SetCore("ResetButtonCallback", false);
                success = true;
            } catch {
                task.wait(0.5);
            }
        }
    });
}

export function Init() {
    print("[Rankgun] Initialising client UI");

    const portal = createPortal(<CentreGui />, playerGui);
    root.render(<StrictMode>{portal}</StrictMode>);

    DisableGui();
    BannerNotify.InitClient();
}
