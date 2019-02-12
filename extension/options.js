function save_options() {
  var port = parseInt(document.getElementById('port').value);
  chrome.storage.sync.set({
    port: port
  }, function() {
    var status = document.getElementById('status');
    chrome.extension.getBackgroundPage().update_menu();
    status.textContent = 'Saved!';
    setTimeout(function() {
      status.textContent = '';
    }, 1500);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    port: 8080
  }, function(items) {
    document.getElementById('port').value = items.port;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
