#!/bin/bash
# BIN_NAME = monero-tui-x86_64-unknown-linux-gnu
# ARCH = x86_64
pushd appimage
pushd monero-tui.AppDir
mkdir -p ./usr/bin
mkdir -p ./usr/lib
popd

wget https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-$ARCH.AppImage -O appimagetool.AppImage
chmod +x appimagetool.AppImage

cp ../bin/$BIN_NAME ./monero-tui.AppDir/usr/bin/monero-tui
cp ../lib/* ./monero-tui.AppDir/usr/lib/

./appimagetool.AppImage -n ./monero-tui.AppDir ../build/$BIN_NAME.AppImage
chmod +x ../build/$BIN_NAME.AppImage
popd
