# Record Comments for Twenty

A comment feed for [Twenty CRM](https://twenty.com) records. It adds a **Comments** tab to Company, Person and Opportunity pages where teammates can leave comments and attach images.

## Features

- **Comments tab** on Company, Person and Opportunity record pages, in the full page and in the side panel.
- **Real authors.** Each comment is posted under the workspace member who writes it, with their avatar and time. Authors can delete their own comments.
- **Image attachments.** Attach one or more images (up to 10 per comment, 10 MB each). They are stored as regular attachments of the record, so they also appear in its **Files** tab.
- **Thumbnails and preview.** Images show as thumbnails. Click one to expand it inside the feed; close it with the X button, a click on the image or Escape. **Original** opens the full-size file in a new tab.
- **Live feed.** New comments from teammates appear within 15 seconds. `Ctrl+Enter` sends.
- **All 33 Twenty languages.** The tab, object and field names and the whole comment UI follow each user's language in Twenty.

## How it works

The app adds one object, `recordComment`, with a `text` field and relations to `company`, `person` and `opportunity`. Deleting a record deletes its comments.

An image is a standard `attachment` linked both to the record and to its comment (`attachment.recordComment`). Deleting a comment keeps the file in the record's Files tab.

The app role requests the `UPLOAD_FILE` and `DOWNLOAD_FILE` permissions to handle images.

## Translations

Every string lives in [`translations/translations.mjs`](translations/translations.mjs). After editing it, run:

```bash
twenty app translations extract   # only if entity labels changed
yarn translations                 # writes locales/*.json and src/utils/strings.generated.ts
```

The script refuses to write anything if a language misses a key or a placeholder. Translations other than English and Russian were written without a native-speaker review; corrections are welcome as pull requests.

## Requirements

- Twenty server 2.58.0 or later.

## Limitations

- Pasting images with `Ctrl+V` is not supported: front components only receive text from the clipboard. Use **Attach image**.
- Comments are available on Company, Person and Opportunity. Supporting another object takes one entry in `COMMENT_TARGETS` in `src/constants/universal-identifiers.ts`.

## Development

Setup instructions live in [SETUP.md](SETUP.md).

```bash
yarn install
twenty auth login --url https://your-twenty-server.com --name dev
twenty app apply --create --remote dev
```

## Publishing

The `Publish` workflow (`.github/workflows/publish.yml`) publishes the app to npm with provenance using [npm trusted publishing](https://docs.npmjs.com/trusted-publishers). To release:

1. Bump `version` in `package.json` and add an entry to [CHANGELOG.md](CHANGELOG.md).
2. Push a version tag: `git tag v0.1.0 && git push --tags`.

## License

[MIT](LICENSE)
