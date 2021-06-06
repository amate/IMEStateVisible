

// 設定読み込み
chrome.storage.sync.get(
  {
    IMEWatchEnable: true, 
    BackgroundColor: "#CCFFCC",
    TextColor: "#000000"
  }, function(value) {
  console.log(value);

  $('#IMEWatchEnableSwitch').prop('checked', value.IMEWatchEnable);

  BGColorChange(value.BackgroundColor, value.TextColor);
});
chrome.storage.local.get({ConnectNativeSucceeded: true}, function(value) {
  if (!value.ConnectNativeSucceeded) {
    console.log("ConnectNativeSucceeded failed");
    $('#ConnectHostFailedAlert').show();
  }
});

// popup.htmlからリンクを新しいタブで開かせるためのtip
$(document).ready(function(){
  $('body').on('click', 'a', function(){
    chrome.tabs.create({url: $(this).attr('href')});
    return false;
  });
});


$('#ColorPicker').change(function() {  
  console.log( $(this).val() );
  BGColorChange($(this).val(), $('#TextRGB').val());

});

$('#BackgroundRGB').keyup(function() {
  console.log( $(this).val() );
  BGColorChange($(this).val(), $('#TextRGB').val());

});

$('#TextColorPicker').change(function() {  
  console.log( $(this).val() );
  BGColorChange($('#BackgroundRGB').val(), $(this).val());

});

$('#TextRGB').keyup(function() {
  console.log( $(this).val() );
  BGColorChange($('#BackgroundRGB').val(), $(this).val());

});


// 有効スイッチ切り替え
$('#IMEWatchEnableSwitch').change(function() {
  console.log("IMEWatchEnableSwitch switch: " + $(this).prop('checked'));

  chrome.storage.sync.set({'IMEWatchEnable': $(this).prop('checked')}, function() {
    UpdateConfig();
  });
});

// 背景色変更
function BGColorChange(color, textColor)
{
  $('#InputSample').css("background-color", color);
  $('#BackgroundRGB').val(color);
  $('#ColorPicker').val(color);

  $('#InputSample').css("color", textColor);
  $('#TextRGB').val(textColor);
  $('#TextColorPicker').val(textColor);

  chrome.storage.sync.set({
    'BackgroundColor': color,
    'TextColor': textColor
  }, function() {
    UpdateConfig();
  });
}

function UpdateConfig()
{
  chrome.runtime.sendMessage({
    event: "UpdateConfig"
  });
}

