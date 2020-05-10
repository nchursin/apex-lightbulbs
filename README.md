![Build status](https://travis-ci.com/nchursin/apex-lightbulbs.svg?branch=master)
![Version](https://img.shields.io/github/package-json/v/nchursin/apex-lightbulbs)
![Installs](https://img.shields.io/visual-studio-marketplace/i/nchursin.apex-lightbulbs)
# Apex Lightbulbs
##### Former _Apex Intention Actions_

A VSCode plugin, an analogue of _Apex Intention Actions_ for Sublime Text 3. Adds quick actions for Salesforce Apex to VSCode such as adding getter, creating constructor, etc.

## Requirements
1. VSCode (obviously)
1. VSCode Extension [salesforce.salesforcedx-vscode-apex](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode-apex)

## Features
Currently existing features:
1. Add { get; set; } to a variable
1. Add constructor
1. Add constructor parameter
1. Add method overload

Planned features:
1. Select constructor to add a parameter. Currently adds to the first constructor in class
1. Add explicit getter and setter
1. Add constructor overload
1. Make test compile for TDD
1. Extract constant from a magic value

## A little demo:
![Getter-setter demo](https://raw.githubusercontent.com/nchursin/apex-lightbulbs/assets/animations/lightbulbs.gif)

## Links
* [Issues](https://github.com/nchursin/apex-lightbulbs/issues)
* [Repository](https://github.com/nchursin/apex-lightbulbs)
* [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=nchursin.apex-lightbulbs)

## References

1. [Sublime Plugin](https://packagecontrol.io/packages/Apex%20Intention%20Actions)
1. [Sublime Plugin wiki](https://github.com/nchursin/ApexIntentionActions/wiki)

## Versioning
Apex Lightbulbs follows [Semantic Versioning 2.0.0](https://semver.org/)

## License
Apache 2.0
