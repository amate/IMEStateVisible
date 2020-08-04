
var lastFocusElement = null;
var lastEvent = null;
var isStartObserving = false;

//$("body").prepend('<div class="txt">Hello World!</div>');

function IsTextInputElement(element)
{
    if ((element.tagName == "INPUT" && (element.type == "text" || element.type == "search")) 
        || element.tagName == "TEXTAREA") 
    {
        return true;
    } else {
        return false;
    }
}


function ObserveInputElementFocus(searchElement)
{
    let textInputArray = searchElement.querySelectorAll("textarea,input[type=text],input[type=search]");
    //console.log("textInputArray.length: " + textInputArray.length);
    textInputArray.forEach(element => {
        element.addEventListener("focus", event => {
            //console.log("focus!");
            SendMessageToBackground("focus", element);
        });
        element.addEventListener("blur", event => {
            //console.log("blur!");
            SendMessageToBackground("blur", element);
        });
    });
}


function StartTextInputFocusObserve()
{
    isStartObserving = true;

    // アクティブな要素に既にフォーカスが当たっている場合
    setTimeout(() => {
        if (IsTextInputElement(document.activeElement)) {
            // focus!
            //console.log("activeElement focus!");
            SendMessageToBackground("focus", document.activeElement);
        }
    }, 1000);

    ObserveInputElementFocus(document);

    // 動的に追加される要素を監視する
    let observer = new MutationObserver(mutationRecords => {
        //console.log(mutationRecords); // console.log(the changes)
        for(let mutation of mutationRecords) {
            // 新しい node を検査する    
            for(let node of mutation.addedNodes) {
                if (!(node instanceof HTMLElement)) {
                    continue;
                }
                ObserveInputElementFocus(node);            
            }
        }
    });
    observer.observe(document, {
        childList: true,
        subtree: true,
    });
}


// 有効なら入力欄のフォーカス遷移を監視する
chrome.storage.sync.get({IMEWatchEnable: true}, function(value) {
    if (value.IMEWatchEnable) {
        StartTextInputFocusObserve();
    }
});

// background.jsへIMEの状態を調べてもらう
function SendMessageToBackground(event, element)
{
    lastEvent = event;
    lastFocusElement = element;
    chrome.runtime.sendMessage({
        event: event
    }, ResponseProcessing);
}

// ホストアプリケーションからのIMEの状態通知を受けて、テキスト入力欄の背景色を変更する
function ResponseProcessing(response)
{
    //console.log(response);

    if (lastEvent == "focus") {
        if (response.IMEEnabled) {            
             $(lastFocusElement).css('background-color', response.BackgroundColor);
        } else {
            $(lastFocusElement).css('background-color', '');
        }
    } else if (lastEvent == "blur") {
        $(lastFocusElement).css('background-color', '');
        lastFocusElement = null;
    }
}

// IMEの状態変化を待ち受けする
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    //console.log("onMessage from background");
    if (request.StartObserve != undefined && request.StartObserve) {
        if (!isStartObserving) {
            StartTextInputFocusObserve();
        }
    } else {
        ResponseProcessing(request);
    }
});

//SendMessageToBackground("focustest");

