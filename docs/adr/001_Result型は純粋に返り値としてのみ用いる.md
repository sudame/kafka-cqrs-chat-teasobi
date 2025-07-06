# ADR-001: Result型は純粋に返り値としてのみ用いる

## 背景

ある程度関数型でプログラムを書こうとすると Result 型が便利である。Result 型とは次のような型のこと。

```ts
type Result<T, E> = Ok<T, E> | Err<T, E>;
```

このプロジェクトでは Result 型として [neverthrow](https://github.com/supermacro/neverthrow) を使用している。

> Type-Safe Errors for JS & TypeScript
> _https://github.com/supermacro/neverthrow_

ところで、関数型プログラミングでは、こうした「ある値が包まれた型」（例えば `Result<string, Error>` であれば `string` 型が包まれた型である）を用いるとき、モナドやファンクターの概念を用いて `flatMap`(`andThen`) や `map` と言ったメソッドで処理を繋げることが多い。このような概念を用いて実装すると、繰り返し現れる処理を記述する回数が減り、プログラムの書き心地が非常に向上する。また慣れてしまえばリーディングの負荷も減少する。

しかしこうした処理はある程度関数型プログラミングに親しんでいなければ扱いづらく、初学者にとっては認知負荷を高める結果にも繋がりかねない。

## 意思決定

このプロジェクトでは `Result` 型は純粋に返り値としてのみ用いる。`flatMap`(`andThen`) や `map` は用いない。例えば次のようなコードを書く。

```ts
const result = someFunction();
if(result.isErr()) {
  return err(result.error);
}
const value = result.value;

// valueを用いた処理など...
```

## 結果

### ポジティブ

- `Result` 型の使用によって（`throw` / `try-catch` での記述に比べて）例外処理が型の上に現れ明確になるだろう
- プログラムが手続き的になり、初学者にも読みやすくなるだろう

### ネガティブ

- 記述量が増えるだろう
- 関数型に慣れ親しんだ者にとっては冗長でむしろ分かりづらいプログラムになるだろう
