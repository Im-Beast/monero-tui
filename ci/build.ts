import { build$, CommandBuilder } from "jsr:@david/dax";

const ARCH = Deno.env.get("ARCH")! as "x86_64" | "aarch64";
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

const allArchTriplets = {
  debug: {
    x86_64: [
      ["x86_64-linux-gnu", "x86_64-unknown-linux-gnu"],
      ["x86_64-apple-darwin11", "x86_64-apple-darwin"],
      ["x86_64-w64-mingw32", "x86_64-pc-windows-msvc"],
    ],
    aarch64: [
      ["aarch64-linux-gnu", "aarch64-unknown-linux-gnu"],
      ["aarch64-apple-darwin11", "aarch64-apple-darwin"],
    ],
  },
  release: {
    x86_64: [
      ["x86_64-linux-gnu", "x86_64-unknown-linux-gnu"],
    ],
    aarch64: [
      ["aarch64-linux-gnu", "aarch64-unknown-linux-gnu"],
    ],
  },
} as const;

const archTriplets = allArchTriplets[DEBUG ? "debug" : "release"];

if (!(ARCH in archTriplets)) {
  console.error(
    "Invalid \x1b[1mARCH\x1b[0m env var:",
    ARCH,
    "Expected any of:",
    Object.keys(archTriplets),
  );
  Deno.exit(1);
}

const triplets = archTriplets[ARCH];

await Deno.remove("./build", { recursive: true }).catch(() => {});
await Deno.mkdir("./build");

for (const [monerocTarget, denoTarget] of triplets) {
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
    switch (ARCH) {
      case "x86_64":
        platform = "linux/amd64";
        break;
      case "aarch64":
        platform = "linux/arm64/v8";
        break;
    }

    await $.raw`docker run \
            -e ARCH=${ARCH}  \
            -e BIN_NAME=${binaryName} \
            -v "$PWD":"$PWD":rw \
            -w "$PWD" \
            --platform "${platform}" \
            imbeast/monero-tui-ci:latest \
            ci/build_appimage.sh`;
  }

  await $`7z a -tzip ./build/${binaryName}.zip -w bin/. lib`;
}
