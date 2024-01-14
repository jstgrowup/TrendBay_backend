# FROM ubuntu
# # i have installed ubuntu here
# RUN apt-get update
# # updating the version
# RUN apt-get install -y curl
# # Installs the 'curl' command, which is a tool for making HTTP requests. It will be used later in the Dockerfile.
# RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
# # Uses 'curl' to download and execute a script from nodesource.com, which sets up the Node.js 18.x repository.
# RUN apt-get upgrade -y
# # Upgrades existing packages to the latest versions.
# RUN apt-get install -y nodejs
# # Installs Node.js and npm (Node Package Manager)
# COPY package.json package.json
# # Copies files and directories from your local machine to the working directory in the container.
# COPY package-lock.json package-lock.json
# COPY src src
# COPY uploads uploads
# COPY tsconfig.json tsconfig.json
# RUN npm install && \
#     npm run cache && \
#     npm run build
# ENTRYPOINT ["npm","run","dev"]
FROM node:14.16-aplpine as build
WORKDIR /src
ADD package*.json ./
RUN npm install
RUN npm run build
EXPOSE 4000
COPY . .
CMD ["npm" ,"run" ,"start"]