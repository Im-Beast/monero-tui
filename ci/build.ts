import { build$, CommandBuilder } from "jsr:@david/dax";

const DEBUG = Deno.env.get("DEBUG") === "true";
const COIN = Deno.env.get("COIN");
const MONERO_C_TAG = Deno.env.get("MONERO_C_TAG");

if (!COIN || !MONERO_C_TAG) {
  console.error(
    "\x1b[1mCOIN\x1b[0m or \x1b[1mMONERO_C_TAG\x1b[0m env vars are missing",
  );
  Deno.exit(1);
}

const $ = build$({
  commandBuilder: new CommandBuilder()
    .printCommand(true)
    .stdin("inherit")
    .stdout("inherit")
    .stderr("inherit"),
});

const triplets = [
  ["x86_64", "x86_64-linux-gnu", "x86_64-unknown-linux-gnu"],
  ["aarch64", "aarch64-linux-gnu", "aarch64-unknown-linux-gnu"],
  ["x86_64", "x86_64-apple-darwin11", "x86_64-apple-darwin"],
  ["aarch64", "aarch64-apple-darwin11", "aarch64-apple-darwin"],
  ["x86_64", "x86_64-w64-mingw32", "x86_64-pc-windows-msvc"],
] as const;

await Deno.remove("./build", { recursive: true }).catch(() => {});
await Deno.mkdir("./build");

for (const [arch, monerocTarget, denoTarget] of triplets) {
  await Deno.remove("./lib", { recursive: true }).catch(() => {});
  await Deno.remove("./bin", { recursive: true }).catch(() => {});
  await Deno.mkdir("./lib");
  await Deno.mkdir("./bin");

  const binaryName = `monero-tui-${denoTarget}`;

  if (DEBUG) {
    await $`bash ./ci/build_moneroc.sh --prebuild --coin ${COIN} --tag ${MONERO_C_TAG} --triplet ${monerocTarget} --location lib`;
  } else {
    await $`bash ./ci/build_moneroc.sh --coin ${COIN} --tag ${MONERO_C_TAG} --triplet ${monerocTarget} --location lib`;
  }

  await $`deno compile --unstable-ffi -A --target ${denoTarget} --output ./bin/${binaryName} ./src/mod.ts`;

  // Building AppImages
  if (monerocTarget.includes("linux")) {
    let platform: string;
    switch (arch) {
      case "x86_64":
        platform = "linux/amd64";
        break;
      case "aarch64":
        platform = "linux/arm64/v8";
        break;
    }

    await $.raw`echo "$PWD"`;
    await $.raw`docker run \
            -e ARCH=${arch}  \
            -e BIN_NAME=${binaryName} \
            -v "$PWD":/source \
            --platform "${platform}" \
            imbeast/monero-tui-ci:latest`;
  }

  await $`7z a -tzip ./build/${binaryName}.zip -w bin/. lib`;
}
