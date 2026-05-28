import { HttpService } from "@rbxts/services";
import { RankResults } from "shared/types";

const BASE_URL = "https://api.rankgun.works";

function httpRequest(path: string, apiToken: string, method: "GET" | "POST", body?: string) {
    const request = HttpService.RequestAsync({
        Url: `${BASE_URL}${path}`,
        Method: method,
        Headers: {
            "x-api-key": apiToken
        },
        ...(body ? { Body: body } : {}),
    });

    if (request.Body) {
        return {
            Body: HttpService.JSONDecode(request.Body),
            StatusCode: request.StatusCode
        }
    } else {
        return {
            Body: { success: false, code: "API_FAILED", error: "Failed to contact Rankgun API" },
            StatusCode: 500
        }
    }
}

export function getRanks(workspaceId: string, apiToken: string): RankResults {
    const apiResponse = httpRequest(`/api/ranking-centre?workspaceId=${workspaceId}`, apiToken, "GET");
    return apiResponse.Body as RankResults;
}

export function setRank(player: Player, rank: number, workspaceId: string, apiToken: string) {
    const apiResponse = httpRequest(
        "/api/roblox/setrank", apiToken, "POST",
        HttpService.JSONEncode({
            rankId: rank,
            userId: player.UserId,
            workspaceId: workspaceId,
        }),
    );
    return apiResponse;
}