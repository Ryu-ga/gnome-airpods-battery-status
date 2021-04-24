# Glaxy Buds Battery Status

A Gnome Shell Extension to display the battery levels of your Galaxy-buds in the top bar.

forked from [Airpods Battery Status](https://github.com/delphiki/gnome-airpods-battery-status/raw/main/screenshot.png)

## Requirements

Install (https://github.com/JojiiOfficial/LiveBudsCli).

Make a ``` /etc/systemd/system/buds-daemon.service ``` for a systemd based system.
```
[Unit]
Description=Galaxy-Buds Battery Monitor

[Service]
ExecStart=[path/to/earbuds(from LiveBudsCli)] status -o json > /tmp/budstatus.out
Restart=always
RestartSec=2

[Install]
WantedBy=default.target
```
Or make a shell script for a non-systemd system.
```
#!/bin/sh

while true; do
  [path/to/earbuds(from LiveBudsCli)] status -o json > /tmp/budstatus.out;
  sleep 2;
done
```
## Installation

```shell
$ mkdir -p ~/.local/share/gnome-shell/extensions/buds-battery-status@Ryu.ga
$ cd ~/.local/share/gnome-shell/extensions/buds-battery-status@Ryu.ga
$ git clone https://github.com/Ryu-ga/gnome-buds-battery-status .
```
