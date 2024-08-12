# Useful Links

Link to API documentation here: https://cyreilv7.github.io/you-kan-api-docs/

API docs github repo: https://github.com/cyreilv7/you-kan-api-docs

# Running the server locally

1. cd to `/you-kan.Server` and run `npm install`
2. Create a sqlite file (e.g., `test.sqlite`) in `/you-kan.Server/db`
3. Create a `.env.test` file in `/you-kan.Server`:
```
  DIALECT=sqlite
  STORAGE=test.sqlite
  LOGGER=false
```
`STORAGE` is the only thing you need to change; it's simply the name of your .sqlite test file relative to the `/db` folder

4. Set the environment variable `NODE_ENV` equal to "test"
  - On windows do `set NODE_ENV=test`
      - If you are using a powershell terminal on Windows (ex. VSCode), the command is `$env:NODE_ENV='test'`
  - MacOS/Linux: `export NODE_ENV=test`

5. Run `npm start` to start the server. You know it's working with the sqlite database if something like this is printed to the terminal:
```
  .env.test
  Server listening on port 8000
  Database connected...
  Models synchronized...
```

## Notes
- The VSCode SQlite extension by alexcvzz is a nice extension that lets you see any changes made to the sqlite db
- If you get any 500 responses, that's usually because the POST requests are missing a field in the column or you're trying to create, for example, a task without its project existing
