# engine-list
Generate data lists via Engine.

## Documentation
### `render(ev, data)`
Renders provided documents.

#### Params
- **Event** `ev`: The event object.
- **Object** `data`: An object containing:
 - `docs` (Array): An array of objects to list.

### `renderOne(ev, data, doNotAppend)`
Renders a document.

#### Params
- **Event** `ev`: The event object.
- **Object** `data`: The data object to be added.
- **Boolean** `doNotAppend`: If true, the item will not be added into HTML its value being returned.

#### Return
- **String** The rendered document HTML.

### `empty()`
Empties the container.

## How to contribute
1. File an issue in the repository, using the bug tracker, describing the
   contribution you'd like to make. This will help us to get you started on the
   right foot.
2. Fork the project in your account and create a new branch:
   `your-great-feature`.
3. Commit your changes in that branch.
4. Open a pull request, and reference the initial issue in the pull request
   message.

## License
See the [LICENSE](./LICENSE) file.
