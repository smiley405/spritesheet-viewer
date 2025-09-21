FROM node:20.11.1-bullseye


# Install Wine and dependencies for Windows builds
RUN dpkg --add-architecture i386 && \
    apt-get update && \
    apt-get install -y \
    wine64 \
    wine32 \
	ffmpeg \
    libfreetype6:i386 \
    libpng16-16:i386 \
    libjpeg62-turbo:i386 \
    libx11-6:i386 \
    libxext6:i386 \
    libxrender1:i386 \
    libssl1.1:i386 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN npm install

# Use root for reliable file access
USER root

# Build for Windows and linux
CMD ["npx", "electron-builder", "--win", "--linux"]

