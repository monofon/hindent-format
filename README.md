# hindent-format README

This extensions uses [`hindent`](https://github.com/commercialhaskell/hindent)
to format Haskell source code. It supports the standard *Format Document* and
*Format Selection* actions.

## Features

The palette command *Hindent: Format Document or Selection* is provided. If
multiple formatters are registered for Haskell documents, this command can be
used to invoke this specific formatter.

## Configuration

`hindent` can be moderately configured by placing a `.hindent.yaml` file in the
workspace directory or the user's home directory. The default configuration is:

``` {.yaml}
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
-   `hindent-format.command`: set the path to the `hindent` executable, no
    arguments should be specified here (default: `hindent`)

## Extension Command

This extension contributes the following command:

-  `hindent-format.format`: Hindent: Format Document or Selection