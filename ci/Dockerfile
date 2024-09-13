FROM ubuntu:20.04

# Specify that its a noninteractive environment so all packages install smoothly
ARG DEBIAN_FRONTEND=noninteractive

# Make sure AppImages can build in the docker
ENV APPIMAGE_EXTRACT_AND_RUN=1

# Install dependencies
RUN apt update && \
    apt install -y tree build-essential pkg-config autoconf libtool ccache make cmake \
    wget gcc g++ git curl lbzip2 libtinfo5 gperf unzip python-is-python3 \
    p7zip-full fuse libfuse2 desktop-file-utils qemu qemu-user-static && \
    apt-get clean && rm -rf /var/lib/apt/lists/
