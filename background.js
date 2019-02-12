'use strict';
var state = 'unknown';

function draw_badge() {
    if (state == 'off') {
        chrome.browserAction.setBadgeText({text: ""});
    } else if (state == 'on') {
        chrome.browserAction.setBadgeBackgroundColor({color: '#2ECC40'});
        chrome.browserAction.setBadgeText({text: "on"});
    } else if (state == 'unknown') {
        chrome.browserAction.setBadgeBackgroundColor({color: '#AAAAAA'});
        chrome.browserAction.setBadgeText({text: "?"});
    }
}

function update_menu() {
    chrome.proxy.settings.get({'incognito': false}, function(config) {
        if (config['levelOfControl'] == "controlled_by_this_extension" && config['value']['mode'] == "fixed_servers") {
            state = 'on';
        } else {
            state = 'off';
        }

        chrome.storage.sync.get({
          port: 8080
        }, function(items) {
            chrome.contextMenus.removeAll();
            draw_badge();
            chrome.contextMenus.create({
                "type": "checkbox",
                "checked": state == 'on',
                "title": "Use localhost:" + items.port + " SOCKS proxy",
                "contexts": ["browser_action"],
                "onclick": function(info, tab) {
                    if (info.checked) {
                        var config = {
                            mode: "fixed_servers",
                            rules: {
                                singleProxy: {
                                    scheme: "socks5",
                                    host: "localhost",
                                    port: items.port
                                },
                                bypassList: ["127.0.0.0/8", "localhost", "::1/32"]
                            }
                        };
                        state = 'on';
                    } else {
                        var config = {mode: 'direct'};
                        state = 'off';
                    }

                    draw_badge();
                    chrome.proxy.settings.set({value: config, scope: 'regular'}, function() {});
                    // chrome.proxy.settings.get({'incognito': false}, function(config) {console.log(JSON.stringify(config));});
                }
            });
        });
    });
}

chrome.proxy.onProxyError.addListener(function(info) {
    chrome.browserAction.setBadgeBackgroundColor({color: '#FF4136'});
    setTimeout(draw_badge, 2000);
});

window.update_menu = update_menu;
update_menu();
