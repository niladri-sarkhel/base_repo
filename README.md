### update all the packages listed in your package.json to their absolute latest versions
```sh
npx npm-check-updates -u
npm install
```

### alias script to read from a specific .env file (e.g.: .env.dev) while starting docker container from a compose.yml file.
```sh
# For Development (uses dev compose file and dev env)
alias dcdev="docker compose -f compose.dev.yml --env-file .env.dev"

# For Production/Default (uses standard compose file and production env)
alias dcprod="docker compose -f compose.yml --env-file .env"

dcdev up -d # to start the container
dcdev logs -f # to see the logs of the container
dcdev down # to stop the container
```

### log into the nodejs docker container
```sh
docker compose exec -it nodejs sh # log using the service name (nodejs), corresponding to the compose.yml
# or, since the container (base_repo_server) is already up and running in the background via Docker Compose, the below command is the exact way to jump inside it:
docker exec -it base_repo_server sh # log using the container name (base_repo_server), corresponding to the compose.yml
npm install # install the npm packages from package.json if they are not installed
npm run dev 
```

### nodemon.json demo config for when nodejs is running locally, not in a docker container
```json
{
    "watch": [
        "src",
        "index.js"
    ],
    "ext": "js,json",
    "exec": "node --env-file=.env.dev index.js"
}
```

### package.json script to point to a particular .env when running nodejs 
```json
  "scripts": {
    "start": "node --env-file=.env.production index.js",
  },
```

### linux command to generate a secret key 
```sh
openssl rand -base64 32
```

```sh
npx auth@latest migrate --config src/lib/auth.lib.js
```