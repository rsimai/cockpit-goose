# Cockpit Goose

A Cockpit plugin to display the Goose web client.

This plugin adds a "Goose" menu item to the Cockpit interface, which embeds the Goose web application, typically running on `http://localhost:3000`. If it's not up, Cockpit will spawn it.

This allows you to interact with the Goose application from within Cockpit.

1. clone the repo
2. link it for Cockpit (regular user) `ln -s ~/git/cockpit-goose ~/.local/share/cockpit/`
3. make sure to configure goose so it can auto-start from Cockpit