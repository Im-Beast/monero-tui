#!/bin/bash
pushd appimage
wget https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-x86_64.AppImage
chmod +x appimagetool-x86_64.AppImage

cp -r ../bin/ ./monero-tui.AppDir/usr/
cp -r ../lib/ ./monero-tui.AppDir/usr/

ARCH=x86_64 ./appimagetool-x86_64.AppImage -n ./monero-tui.AppDir ../bin/monero-tui-x86_64-unknown-linux-gnu.AppImage
popd
