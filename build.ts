import { build$, CommandBuilder } from "jsr:@david/dax";

const DEBUG = Deno.env.get("DEBUG") === "true";
const COIN = Deno.env.get("COIN");
const MONERO_C_TAG = Deno.env.get("MONERO_C_TAG");

if (!COIN || !MONERO_C_TAG) {
    console.error("\x1b[1mCOIN\x1b[0m or \x1b[1mMONERO_C_TAG\x1b[0m env vars are missing");
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

for (const [arch, moneroc_target, deno_target] of triplets) {
    await Deno.remove("./lib", { recursive: true }).catch(() => {});
    await Deno.remove("./bin", { recursive: true }).catch(() => {});
    await Deno.mkdir("./lib");
    await Deno.mkdir("./bin");

    const binaryName = `monero-tui-${deno_target}`;

    if (DEBUG) {
        await $`bash ./build_moneroc.sh --prebuild --coin ${COIN} --tag ${MONERO_C_TAG} --triplet ${moneroc_target} --location lib`;
    } else {
        await $`bash ./build_moneroc.sh --coin ${COIN} --tag ${MONERO_C_TAG} --triplet ${moneroc_target} --location lib`;
    }

    await $`deno compile --unstable-ffi -A --target ${deno_target} --output ./bin/${binaryName} ./src/mod.ts`;

    if (moneroc_target.includes("linux")) {
        if (arch === "x86_64") {
            await $`ARCH=${arch} BIN_NAME=${binaryName} ./build_appimage.sh`;
        } else {
            // Adapted from https://github.com/AppImage/appimagetool/blob/main/ci/build-in-docker.sh
            let image_prefix: string;
            let platform: string;
            switch (arch) {
                case "aarch64":
                    image_prefix = "arm64v8";
                    platform = "linux/arm64/v8";
                    break;
            }

            // libassuan-static is supported only from 3.19 onwards
            const image = `${image_prefix}/alpine:3.19`;

            // run the build with the current user to
            //   a) make sure root is not required for builds
            //   b) allow the build scripts to "mv" the binaries into the /out directory
            const uid = await $`id -u`.text();

            await $.raw`docker pull "${image}"`;
            await $.raw`docker run                  \
            --rm                                    \
            --platform "${platform}"                \
            -i                                      \
            -e GITHUB_ACTIONS                       \
            -e GITHUB_RUN_NUMBER                    \
            -e OUT_UID="${uid}"                     \
            -v "$PWD":/work                         \
            -w /work                                \
            "${image}"                              \
            apk add bash curl jq && ARCH=${arch} BIN_NAME=${binaryName} ./build_appimage.sh`;
        }
    }

    await $`7z a -tzip ./build/${binaryName}.zip -w bin/. lib`;
}
