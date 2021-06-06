# IMEStateVisible

![](https://raw.githubusercontent.com/amate/IMEStateVisible/images/images/ss1.jpg)

## ■はじめに
このChrome拡張は、IMEがオン(日本語入力)時に、テキスト入力欄の背景色を変更することによって、間違えて英文字モードでローマ字を打ってしまうのを防ぐために作られました

## ■動作確認環境
・Windows 10 home 64bit バージョン 1903  
・vivaldi  
・Microsoft Edge  
chromeは導入していないので分からないが、おそらく動作するはず…  

## ■導入方法

拡張機能単体ではIMEの状態を取得できないので、外部のホストアプリケーションをインストールする必要があります

https://github.com/amate/IMEStateVisible/releases/latest
から zipファイルをダウンロードし、適当なフォルダに解凍した後、"install_host.bat"を実行してください

ブラウザを再起動して、適当なテキスト入力欄でIMEをオンにしたときに、背景の色が変わっていれば導入成功です

## ■使用ライブラリ・素材

host  
- JSON for Modern C++  
https://github.com/nlohmann/json


html  
- bootstrap  
https://getbootstrap.com/

- jQuery  
https://jquery.org/

icon
- ICOOON MONO  
https://icooon-mono.com/


## ■著作権表示
Copyright (C) 2020 amate

私が書いた部分のソースコードは、MIT License とします。

## ■更新履歴

<pre>

v1.1.1
・[fix] 背景色のプリセットが消えていたのを修正

v1.1
・[add] 文字色も変更可能にした
・[fix] 入力欄から入力欄にフォーカスが移動したときに、以前にフォーカスされていた入力欄の背景の色が変わったままになるバグを修正

v1.0
・公開

</pre>
