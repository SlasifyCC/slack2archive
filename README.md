Slack2Archive

---

Converts the slack messages exported by [slack-exporter](https://github.com/SlasifyCC/slack-exporter) to readable archive files.

## Usage

There are 2 running modes:

### Typed mode

Read exported data using the exact file structure of **slack-exporter**'s output.

```shell
s2a <public|private|dm> <EXPORTED_DATA_ROOT_DIR> <OUTPUT_DIR>
```

For example, this command:

```shell
s2a public ./exported ./archive/public
```

will archive public messages (at `./exported/channels/public`) to `./archive/public`.

### Custom mode

In this mode, you will need to specify every directory and configuration. It is useful if the exported data's file
structure is altered.

Use `s2a custom -h` to check the arguments and options.

For example, this command:

```shell
s2a custom ./exported/foo/unarchived ./archive/foo/pubilc/unarchived --category 001 --contentDir 001 -m 001.csv
-u ../users.json,bot_users.json,delete_users.json -g ../userGroup.json
```

Will use the following settings:

- Read user list from
  - `./exported/foo/users.json`
  - `./exported/foo/bot_users.json`
  - `./exported/foo/delete_user.json`
- Read user groups (teams) from `./exported/foo/userGroup.json`
- Read channel list from `./exported/foo/unarchived/001.csv`
- Read messages from `./exported/foo/unarchived/001`
- Write results to `./archive/foo/public/unarchived/001`

## Development

1. `npm install`
1. `npm run dev.install` to register the bin as a global command.
1. `npm start` to run `tsc` in watch mode.
1. Update a source file and run the command `s2a` directly.
