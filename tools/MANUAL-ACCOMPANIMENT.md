# 手入力伴奏データの拡張案

自動生成や伴奏の操作画面はアプリから外しています。将来、製作者が音符を入力して伴奏を付ける場合は、曲データに任意の `accompaniment` を追加する形にできます。

```json
{
  "accompaniment": {
    "version": 1,
    "parts": [
      {
        "id": "cello",
        "name": "チェロ",
        "instrument": "cello",
        "volume": 0.45,
        "events": [
          { "beat": 0, "midi": 48, "duration": 2, "velocity": 0.6 }
        ]
      }
    ]
  }
}
```

`beat` は曲頭からの拍数、`midi` は MIDI 音高、`duration` は拍単位の長さ、`velocity` と `volume` は 0〜1 の強さです。各パートは同じ形式の `events` を持ちます。この形式は将来の手入力機能に向けた予約案で、現在のアプリは読み込み・保存・再生を行いません。
