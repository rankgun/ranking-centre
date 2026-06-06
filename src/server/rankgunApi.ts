import { HttpService } from "@rbxts/services";
import { RankResults } from "shared/types";

import { Telemetry } from "./telemetry";

const BASE_URL = "https://api.rankgun.works";

let verbose = false;

export function setVerbose(value: boolean) {
    verbose = value;
}

/** Report a non-200 response as an api_error event (status + short code only). */
function reportError(call: string, statusCode: number, body: unknown) {
    if (statusCode === 200) {
        return;
    }
    Telemetry.track("api_error", {
        call,
        httpStatus: statusCode,
        code: (body as { code?: string }).code,
    });
}

function httpRequest(path: string, apiToken: string, method: "GET" | "POST", body?: string) {
    if (verbose) print(`[Rankgun] → ${method} ${path}${body ? ` ${body}` : ""}`);

    const request = HttpService.RequestAsync({
        Url: `${BASE_URL}${path}`,
        Method: method,
        Headers: {
            "x-api-key": apiToken
        },
        ...(body ? { Body: body } : {}),
    });

    if (request.Body) {
        const decodedBody = HttpService.JSONDecode(request.Body) as object;
        if (verbose) print(`[Rankgun] ← ${request.StatusCode} ${HttpService.JSONEncode(decodedBody)}`);
        return {
            Body: decodedBody,
            StatusCode: request.StatusCode
        }
    } else {
        if (verbose) warn(`[Rankgun] ← ${request.StatusCode} (empty body)`);
        return {
            Body: { success: false, code: "API_FAILED", error: "Failed to contact Rankgun API" },
            StatusCode: 500
        }
    }
}

export function getRanks(workspaceId: string, apiToken: string): RankResults {
    const apiResponse = httpRequest(`/api/ranking-centre?workspaceId=${workspaceId}`, apiToken, "GET");
    reportError("ranks", apiResponse.StatusCode, apiResponse.Body);
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
    reportError("setrank", apiResponse.StatusCode, apiResponse.Body);
    return apiResponse;
}