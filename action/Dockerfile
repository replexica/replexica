# Container image that runs your code
FROM node:20-alpine

# Install git and github-cli
RUN apk add --no-cache git github-cli

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY entrypoint.sh /entrypoint.sh
COPY pr.md /pr.md

# Make entrypoint.sh executable
RUN chmod +x /entrypoint.sh

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["/entrypoint.sh"]
