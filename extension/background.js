
var contentScriptCallback = null;
var nativeHostPort = null;

// 設定読み込み
var config =   {
  IMEWatchEnable: true, 
  BackgroundColor: "#CCFFCC",
  TextColor: "#000000"
};

chrome.storage.sync.get(config, function(value) {
  console.log("LoadConfig: ", value);
  config = value;
});

// 起動時にホストアプリケーションを立ち上げる
chrome.storage.local.set({ConnectNativeSucceeded: true});
nativeHostPort = chrome.runtime.connectNative('imestatevisiblehost');
console.log("connectNative");

// hostアプリケーションからのメッセージ
nativeHostPort.onMessage.addListener(function(msg) {
  console.log("Received :", msg);
  if (!config.IMEWatchEnable)  {
    return ;
  }

  msg.BackgroundColor = config.BackgroundColor;
  msg.TextColor = config.TextColor;

  if (contentScriptCallback != null) {
    contentScriptCallback(msg);
    contentScriptCallback = null;
  } else {
    chrome.tabs.query( {active:true, currentWindow:true}, function(tabs){
      chrome.tabs.sendMessage(tabs[0].id, msg);
    });
  }
});

nativeHostPort.onDisconnect.addListener(function() {
  console.log("Disconnected");
  chrome.storage.local.set({ConnectNativeSucceeded: false});
});

// contentscript or popupからのメッセージ
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("onMessage from contentscript event: " + request.event);
  if (request.event == "UpdateConfig") {
    chrome.storage.sync.get(config, function(value) {
      console.log("LoadConfig: ", value);
      config = value;

      if (config.IMEWatchEnable) {
        chrome.tabs.query( {active:true, currentWindow:true}, function(tabs){
          chrome.tabs.sendMessage(tabs[0].id, {StartObserve: true});
        });
      }
    });
    return false;
  }

  nativeHostPort.postMessage({ event: request.event });
  contentScriptCallback = sendResponse;
  return true;
});
