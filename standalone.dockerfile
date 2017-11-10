FROM node:boron 

ARG SERVICE_PORT

ENV PORT ${PORT:-${SERVICE_PORT:-80}}

RUN echo "Port -> $PORT"

# Creates the app directory
WORKDIR /apps/nodejs

RUN echo "Directory -> $(pwd)"

# Copy source code
COPY . .

# Show directory contents
RUN ls -la .

# Install app dependencies 
COPY package.json .
# For npm@5 or later (which is what we have)
#COPY package-lock.json .

RUN npm install 

EXPOSE $PORT

CMD ["npm", "run", "start"]