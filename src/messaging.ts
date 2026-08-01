// Tiny runtime-messaging contract between the popup and the content script,
// used only to report the current tab's in-memory match count — no post
// content ever crosses this, just a number.

export const GET_MATCH_COUNT = "shortlist:get-match-count";

export interface GetMatchCountRequest {
  type: typeof GET_MATCH_COUNT;
}

export interface GetMatchCountResponse {
  count: number;
}
