---
name: sys1grep
description: 意味で行を探す grep（@uehaj/sys1grep 0.5.0-next.0、旧 semgrep）でファイル・ログ・git のコミットから該当行を示す。/uehaj:sys1grep <探したい意味> [対象] [sys1grep のオプション]（skills CLI で入れた場合は /sys1grep）
disable-model-invocation: true
---

# /uehaj:sys1grep — 意味で探す

`sys1grep`（TypeSafe Jev で 1 行ずつ「この意味に合うか」の確率を出す grep。旧名 semgrep。
https://github.com/uehaj/sys1grep ）を使って、ユーザーの言葉で示された意味に合う行を探し、結果を示す。

コマンドは版を固定して `npx -y @uehaj/sys1grep@0.5.0-next.0` で呼ぶ（以下の例の `sys1grep` はすべてこれに読み替える）。
PATH の `sys1grep` や旧 `semgrep` は版が違うことがあるので使わない。
API キーは環境変数 `SYS1GREP_API_KEY`（無ければ `TYPESAFE_API_KEY`）か `~/.config/sys1grep/.env` から読まれる。
`./.env` は読まれない。旧 `SEMGREP_*` と `~/.config/semgrep/.env` も 0.5 の間は読まれるが、使うたびに移行を促す 1 行が出る。
キー未設定のエラーが出たら `sys1grep --help` 末尾の設定手順をそのまま示して止まる。

**検索した行はすべて TypeSafe の API に送られる。** 対象に秘密情報や社外秘が含まれそうなら、実行前にその旨を 1 行添える。

## 手順

1. **引数を読む。** `$ARGUMENTS` は「探したい意味」と、あれば「対象」（ファイル、glob、ディレクトリ、git のコミット、
   またはコマンド出力）、それに sys1grep のオプション。`-` で始まる語（`-r`、`-g`、`-C 2`、`--level strict`、`-p`、`-c`、
   `-l` など）とその値は、解釈せずそのまま渡す。ユーザーが `-e` / `-a` / `-v` を自分で書いていれば式もそのまま使い、
   手順 2 は飛ばす。対象が無ければ会話の文脈から決め、決められなければ聞く。ディレクトリ全体は行ごとに課金されるので、
   `package-lock.json` や大きな生成物・ログは外し、文書やソースなど意味のあるファイルに絞る。
   **使う前に効果を見積もる。** sys1grep が安くて速いのは、次の 3 つが揃うときだけ（実測: 51 行で直読みの 2/3 の費用・時間、
   14 行では割高。損益分岐はおよそ 50 行）。

   - **マッチした行を見た後で、対象全体を読まずに済むと予想できる。** 「意味に合う行を抜き出す」タスクはこれに当たる。
     対象を読んで理解し何かを書くタスク（概要図、要約、設計の把握）は当たらない。sys1grep で当たりをつけても
     結局全体を読むので、その分がまるごと上乗せになる（1,900 行のコード概要図で費用 1.5 倍）。
   - 語彙で絞れない。`grep -iE 'release|publish|tag'` のように語が予想できるなら grep で絞って読む方が同等の精度で安い。
     多言語の文、否定条件（「〜ではない」）、言い換えの多い意味だけが sys1grep の出番。
   - 対象が数十行を超える。数十行以下なら直読みの方が安い。

   揃わないときは sys1grep を使わず、直読みか grep で答え、そうした理由を 1 行添える。
   揃っていても、**マッチした後に対象全体を開いてしまえば節約はゼロになる。** 周辺が要るときは `-C N` で
   前後だけを読み、それでも足りない箇所だけ `sed -n` で行範囲を指定して読む。
   また対象が JSONL のような巨大行なら、どの方式でも先に 1 件 1 行に抜き出す前処理が要る。

2. **意味を式に組む。** 意味は英語で書く（精度が最も安定する。ユーザーが日本語で言っても英訳してよい）。
   「A または B」は `-e A -e B`、「A かつ B」は `-e A -a B`、「A だが B でない」は `-e A -v B`。
   1 つの意味に複数の条件を詰め込まず、条件ごとに `-e/-a/-v` に分ける。
   時期（today, yesterday, last week）・言語や拡張子（Python, `.mjs`）・場所（test code, README, docs）・作者・
   git の状態（uncommitted, this branch）は、意味の中に書いてよい。`-r` と `-g` では auto-scope が Jev に聞いて
   その条件で対象を先に絞り、判定のリクエストにもその条件を満たしていると添える。
   ただし auto-scope が効くのは項が 1 つのとき（`-g`）か、項ごと（`-r`）。条件と中身は同じ `-e` に書く。
3. **実行する。** 常に `-n` を付ける。複数ファイルやディレクトリなら `-r`。前後が要る依頼なら `-C 2`。
   コミットを探すなら、パイプではなく `-g` を使う（1 コミット 1 レコード。ハッシュ・日付・件名・本文）。
   例:

   ```sh
   npx -y @uehaj/sys1grep@0.5.0-next.0 -n -e "customer is asking for a refund" -v "the refund was already issued" tickets/*.txt
   npx -y @uehaj/sys1grep@0.5.0-next.0 -r -n -e "test code changed yesterday that retries a request" .
   npx -y @uehaj/sys1grep@0.5.0-next.0 -g -e "a performance fix to the .mjs files today"
   ```

   `-g` は `-r` と一緒に使えない。ファイル名を付けると git log の pathspec になる（`-g -e "…" src/`）。
   コミットは `-Q`（問いへの答え）より `-e`（〜をした記述）の方が当たりやすい。
   stderr の `sys1grep: scope: …` と `sys1grep: git log …` の行が、auto-scope で絞った条件。

4. **結果を判定する。** 出力の各行を読み、意味に合っていない行が混ざっていれば `-p` を付けて確率を確かめ、
   `--level strict` で再実行する。何も出なければ `--level loose` で再実行し、それでも無ければ「該当なし」と伝える。
   絞り込みが外れていそうなら（stderr の scope 行が意図と違う）`--verbose` で候補と答えを見て、
   `--no-auto-scope` か `--include` / `--changed-within` で明示して再実行する。
   終了コード 2 はエラーなので stderr をそのまま示す。
5. **報告する。** `file:line:` 付きの該当行（`-g` ならコミットのハッシュと件名）をそのまま示し、件数と、
   使った式と、効いた scope を 1 行添える。
   ユーザーが次に打てるコマンドを 1 つ提案する（`-C` で文脈、`-l` でファイル名だけ、`-c` で件数、など）。

完了条件: 該当行が `file:line` 付き（`-g` ならコミット付き）で示されているか、「該当なし」と根拠（式・閾値・scope）が示されている。

## オプション早見

`sys1grep --help` が正。ここは式の組み方と対象の選び方に関わるものだけ。

| 目的 | オプション |
|---|---|
| OR / AND / AND NOT | `-e A -e B` / `-e A -a B` / `-e A -v B`。`'!B'` は個別否定 |
| 取りこぼしを減らす / 確実な行だけ | `--level loose` / `--level strict`（`-t` `-T` で個別指定） |
| 確率を見る / 絞り込みの中身を見る | `-p` / `--verbose` |
| 文脈 / ファイル名だけ / 件数 | `-C N` / `-l` / `-c` |
| 再帰 | `-r`（.git、node_modules、.env や鍵、.gitignore の対象は自動で除外） |
| git のコミットを探す | `-g`（auto-scope が `--since` / pathspec / `--author` / 範囲になる） |
| 意味から対象を絞らない | `--no-auto-scope` |
| 送る前に件数と費用を見る | `--dry-run`、または `-i`（見せてから聞く） |
