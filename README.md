# hindent-format README

This extensions uses [`hindent`](https://github.com/commercialhaskell/hindent)
to format Haskell source code. It supports the standard *Format Document* and
*Format Selection* actions.

## Configuration

`hindent` can be moderately configured by placing a `.hindent.yaml` file in the
workspace or user home directories. The default configuration is:

```yaml
indent-size: 2
line-length: 80
force-trailing-newline: true
```

## Requirements

This extension requires at least
[`hindent`](https://github.com/commercialhaskell/hindent) version 5.2.3 to be
installed.

## Extension Settings

This extension contributes the following settings:

-   `hindent-format.enable`: enable/disable this extension (default: `true`)
-   `hindent-format.command`: set the path to the `hindent` executable (default:
    `hindent`)
