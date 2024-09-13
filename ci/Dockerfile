FROM ubuntu:20.04

RUN --mount=type=bind,source=.,target=/source,rw
WORKDIR /source

# Specify that its a noninteractive environment so all packages install smoothly
ARG DEBIAN_FRONTEND=noninteractive

# Make sure AppImages can build in the docker
ENV APPIMAGE_EXTRACT_AND_RUN=1

# Install dependencies
RUN apt update
RUN apt install -y tree build-essential pkg-config autoconf libtool ccache make cmake \
    wget gcc g++ git curl lbzip2 libtinfo5 gperf unzip python-is-python3 \
    p7zip-full fuse libfuse2 desktop-file-utils

# Clean cache and temp files to reduce image size
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

ENTRYPOINT [ "./ci/build_appimage.sh" ]
