# Worship Assistant

A simple app to assist worship service presentations

## Bible Text

The app comes with the Chinese Union Version (和合本, public domain). It doesn't include an English translation, so load one before showing English text:

1. Get a Bible text file for a translation you are allowed to use. Many modern translations are copyrighted and need permission from their publisher. Public domain English translations include the Berean Standard Bible (BSB), the World English Bible (WEB) and the King James Version (KJV).
2. In the app, choose **Bible › Load English Bible Text…** and select the file.

You can also replace the built-in Chinese text with **Bible › Load Chinese Bible Text…**.

The app copies the file into its `data` folder, next to `Worship Assistant.exe`. **Settings › Import from Previous Version…** also copies loaded Bible text files when you upgrade.

### File format

A UTF-8 text file with one verse per line, written as `<book> <chapter>:<verse> <text>`. The book name can be separated from the reference by spaces or a tab:

```
Gen 1:1 In the beginning, God created the heavens and the earth.
Genesis 1:2	The earth was without form and void…
```

Books can be written as full English names (`Genesis`, `1 Samuel`), common abbreviations (`Gen`, `1Sam`, `Ps`, `Matt`) or Chinese names (`创世纪`, `创`). Lines that aren't verses, such as a title line, are skipped. The app tells you if any verses are missing or any book names aren't recognized.

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win
```

## App Screenshots

### Bible Text

#### Control Panel

![image](https://github.com/yeuharn96/worship-assistant/assets/90096151/9f9cf25f-cfb8-4431-9a97-8eb7fc580a02)

#### Presenter View

![image](https://github.com/yeuharn96/worship-assistant/assets/90096151/45e29ce9-a512-4d9b-9b5b-350ff5acfc10)

### Video

#### Control Panel

![image](https://github.com/yeuharn96/worship-assistant/assets/90096151/157fcbac-f8ce-4a1e-a241-1a57987331b7)

#### Presenter View

![image](https://github.com/yeuharn96/worship-assistant/assets/90096151/e12973ea-6f57-4a25-987e-3f3c9f8bf812)
