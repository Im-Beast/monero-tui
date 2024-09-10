#!/bin/bash
# BIN_NAME = monero-tui-x86_64-unknown-linux-gnu
# ARCH = x86_64

echo "Before:"
tree
pushd appimage
wget https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-$ARCH.AppImage -O appimagetool.AppImage
chmod +x appimagetool.AppImage

pushd monero-tui.AppDir
mkdir -p ./usr/bin
mkdir -p ./usr/lib
popd

cp ../bin/$BIN_NAME ./monero-tui.AppDir/usr/bin/monero-tui
cp ../lib/* ./monero-tui.AppDir/usr/lib/

./appimagetool.AppImage -n ./monero-tui.AppDir ../bin/$BIN_NAME.AppImage
chmod +x ../bin/$BIN_NAME.AppImage
popd
echo "After:"
tree
