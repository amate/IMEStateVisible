// IMEStateVisibleHost.cpp : アプリケーションのエントリ ポイントを定義します。
//

#include "framework.h"
#include "IMEStateVisibleHost.h"
#include <string>
#include <iostream>
#include <io.h>
#include <fcntl.h>

#include <imm.h>
#include <crtdbg.h>
#include <assert.h>

#include "json.hpp"

#pragma comment(lib, "Imm32.lib")

using json = nlohmann::json;

// https://qiita.com/kob58im/items/a1644b36366f4d094a2c#%E3%81%8A%E3%81%BE%E3%81%91---windows10%E3%81%A7%E7%94%BB%E9%9D%A2%E4%B8%AD%E5%A4%AE%E3%81%AB%E8%A1%A8%E7%A4%BA%E3%81%95%E3%82%8C%E3%82%8B%E3%81%82a%E3%82%92%E3%82%AA%E3%83%95%E3%81%99%E3%82%8B

#define IMC_GETCONVERSIONMODE    1
#define IMC_GETOPENSTATUS        5

constexpr int kIMEWatchTimerId = 1;
constexpr int kIMEWatchTimerInterval = 500;

// グローバル変数:
HINSTANCE hInst;                                // 現在のインターフェイス
bool    g_lastIMEEnabled = false;

bool    IsActiveWindowIMEEnabled()
{
    GUITHREADINFO guiThreadInfo = { sizeof(GUITHREADINFO) };
    if (!::GetGUIThreadInfo(0, &guiThreadInfo)) {
        return 0;   // failed
    }
    HWND hwndDefaultIME = ::ImmGetDefaultIMEWnd(guiThreadInfo.hwndFocus);

    //int  imeConvMode = ::SendMessage(hwndDefaultIME, WM_IME_CONTROL, IMC_GETCONVERSIONMODE, 0);
    bool imeEnabled = (::SendMessage(hwndDefaultIME, WM_IME_CONTROL, IMC_GETOPENSTATUS, 0) != 0);
    _RPTWN(_CRT_WARN, L"hwndDefaultIME: %x imeEnabled: %d\n", hwndDefaultIME, imeEnabled);
    return imeEnabled;
}

void    SendIMEStatus()
{
    bool imeEnabled = IsActiveWindowIMEEnabled();

    json jsonMsg;
    jsonMsg["status"] = "ok";
    jsonMsg["IMEEnabled"] = imeEnabled;
    std::string msg = jsonMsg.dump();
    int length = static_cast<int>(msg.length());
    std::cout.write((const char*)&length, sizeof(int));
    std::cout << msg;
    std::cout.flush();

    g_lastIMEEnabled = imeEnabled;
    _RPTN(_CRT_WARN, "send, IMEEnabled: %d\n", imeEnabled);
}

VOID CALLBACK TimerRoutine(PVOID lpParam, BOOLEAN TimerOrWaitFired)
{
    bool imeEnabled = IsActiveWindowIMEEnabled();
    if (imeEnabled != g_lastIMEEnabled) {
        SendIMEStatus();
    }
}


// このコード モジュールに含まれる関数の宣言を転送します:

int APIENTRY wWinMain(_In_ HINSTANCE hInstance,
    _In_opt_ HINSTANCE hPrevInstance,
    _In_ LPWSTR    lpCmdLine,
    _In_ int       nCmdShow)
{
    UNREFERENCED_PARAMETER(hPrevInstance);
    UNREFERENCED_PARAMETER(lpCmdLine);

    // TODO: ここにコードを挿入してください。
#if 0
    if (::wcslen(lpCmdLine) == 0) {
        ::AllocConsole();   // for debug
    }
#endif
    std::wstring cmdLine = lpCmdLine;
    if (cmdLine.empty()) {
        return 0;
    }
    if (cmdLine.find(L"-install") != std::wstring::npos) {
        MessageBox(NULL, L"インストールが完了しました。", L"成功", MB_OK);
        return 0;
    }
    if (cmdLine.find(L"-uninstall") != std::wstring::npos) {
        MessageBox(NULL, L"アンインストールが完了しました。", L"成功", MB_OK);
        return 0;
    }

    //assert(false);

    //PrepareStdIO();

    _setmode(_fileno(stdin), _O_BINARY);
    _setmode(_fileno(stdout), _O_BINARY);

    HANDLE hTimerQueue = NULL;

    for (;;){
        int readBytes = 0;
        std::cin.read((char*)&readBytes, sizeof(int));
        if (readBytes == 0) {
            return 0;
        }

        std::string inData;
        inData.resize(readBytes);
        std::cin.read(const_cast<char*>(inData.data()), readBytes);
        _RPTN(_CRT_WARN, "recieve: %s\n", inData.c_str());

        json jsonRecieve = json::parse(inData);
        std::string event =  jsonRecieve["event"].get<std::string>();

        
        if (event == "focus") {
            if (hTimerQueue) {
                //assert(false);
                DeleteTimerQueueEx(hTimerQueue, NULL);
            }
            hTimerQueue = CreateTimerQueue();
            HANDLE hTimer = NULL;
            if (!CreateTimerQueueTimer(&hTimer, hTimerQueue,
                (WAITORTIMERCALLBACK)TimerRoutine, nullptr, kIMEWatchTimerInterval, kIMEWatchTimerInterval, 0)) {
                assert(false);
            }

        } else if (event == "blur") {
            DeleteTimerQueueEx(hTimerQueue, NULL);
            hTimerQueue = NULL;
        }

        SendIMEStatus();
    }
    return 0;
}


