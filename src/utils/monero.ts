// https://github.com/monero-project/monero/blob/a1dc85c5373a30f14aaf7dcfdd95f5a7375d3623/src/cryptonote_basic/cryptonote_format_utils.cpp#L1160
export function formatXMR(amount: bigint): string {
  let string = String(amount);
  if (string.length < 13) {
    string = "0".repeat(13 - string.length) + string;
  }
  return string.slice(0, -12) + "." + string.slice(-12);
}
