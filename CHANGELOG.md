# Change Log

All notable changes to the "hindent-format" extension will be documented in this
file.

## 0.0.10

-   allow shell commands in `hindent-format.command` (fixes #10)

## 0.0.7

-   add `hindent-format.format` command
-   fix project structure
-   fix CWD for `hindent` invocation to pick up `.hindent.yaml`
-   sanitize `hindent-format.command` property to contain only the invocation
    path of the `hindent` command
