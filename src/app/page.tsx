"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [buyerId, setBuyerId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "登録に失敗しました");
        return;
      }

      setBuyerId(data.id);
      setSubmitted(true);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">登録完了！</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            ご登録ありがとうございます。<br />
            希望条件を設定すると、条件に合う案件だけをお届けします。
          </p>
          <a
            href={`/preferences/${buyerId}`}
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md hover:shadow-lg"
          >
            希望条件を設定する
          </a>
          <p className="text-gray-400 text-sm mt-5">
            あとから設定することもできます
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーション */}
      <nav className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">M&A<span className="text-blue-600">レーダー</span></span>
          <a href="#register" className="text-sm bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
            無料で登録
          </a>
        </div>
      </nav>

      {/* ヒーローセクション */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-block bg-blue-700/50 text-blue-200 text-sm px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm border border-blue-600/30">
            完全無料 &middot; 条件に合う案件だけをお届け
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            M&A案件を、<br className="md:hidden" />
            <span className="text-blue-300">自動で</span>キャッチ。
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            複数のM&Aサイトから案件を自動収集。<br />
            あなたの希望条件に合う案件だけを、メールでお届けします。
          </p>

          {/* ヒーロー内フォーム */}
          <div className="max-w-md mx-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 text-red-200 rounded-lg text-sm border border-red-400/30">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレスを入力"
                className="flex-1 px-4 py-3.5 rounded-lg text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-500 text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 transition shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                {loading ? "登録中..." : "無料で始める"}
              </button>
            </form>
            <p className="text-blue-300/70 text-xs mt-3">
              登録後に希望条件（業種・エリア・価格帯・売上規模）を設定できます
            </p>
          </div>
        </div>
      </section>

      {/* 数字で見る実績 */}
      <section className="bg-gray-50 border-b">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { num: "1,800+", label: "掲載案件数" },
              { num: "毎日", label: "案件を自動更新" },
              { num: "0円", label: "完全無料" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-3xl md:text-4xl font-bold text-blue-600">{item.num}</p>
                <p className="text-gray-500 text-sm mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 収集の仕組み */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          バラバラのM&Aサイトを、<span className="text-blue-600">一括チェック</span>
        </h2>
        <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
          M&A案件は複数のプラットフォームに分散しています。<br className="hidden md:inline" />
          M&Aレーダーがすべてを巡回し、あなたに合う案件だけをピックアップします。
        </p>

        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-4">
          {/* 左：サイト群 */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "M&Aクラウド", count: "1,800+件", active: true },
                { name: "バトンズ", count: "15,000+件", active: false },
                { name: "トランビ", count: "3,000+件", active: false },
                { name: "SPEED M&A", count: "1,500+件", active: false },
                { name: "M&Aサクシード", count: "8,000+件", active: false },
                { name: "順次追加中...", count: "", active: false },
              ].map((site) => (
                <div
                  key={site.name}
                  className={`rounded-xl border-2 px-4 py-4 text-center transition ${
                    site.active
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-gray-50 opacity-60"
                  }`}
                >
                  <p className={`font-bold text-sm ${site.active ? "text-blue-700" : "text-gray-600"}`}>
                    {site.name}
                  </p>
                  {site.count && (
                    <p className={`text-xs mt-1 ${site.active ? "text-blue-500" : "text-gray-400"}`}>
                      {site.count}
                    </p>
                  )}
                  {site.active && (
                    <span className="inline-block mt-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      対応済み
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 中央：矢印 */}
          <div className="flex md:flex-col items-center gap-2 text-blue-400 py-4">
            <svg className="w-8 h-8 rotate-90 md:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">自動収集</span>
            <svg className="w-8 h-8 rotate-90 md:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>

          {/* 右：M&Aレーダー */}
          <div className="flex-1 w-full max-w-xs">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-8 text-center shadow-xl">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-bold text-lg mb-1">M&Aレーダー</p>
              <p className="text-blue-200 text-sm mb-4">AIが分析・分類</p>
              <svg className="w-6 h-6 mx-auto text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <div className="mt-4 bg-white/10 rounded-lg px-4 py-3 backdrop-blur-sm">
                <p className="text-sm font-medium">あなたにメール通知</p>
                <p className="text-blue-200 text-xs mt-1">条件マッチした案件のみ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* こんな方におすすめ */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">こんな方におすすめ</h2>
        <p className="text-gray-500 text-center mb-12">事業買収・承継を検討しているすべての方へ</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              ),
              title: "案件探しに時間がかかる",
              desc: "複数のM&Aサイトを毎日チェックする手間から解放。自動で収集してお届けします。",
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              ),
              title: "新規事業や事業拡大を検討中",
              desc: "希望の業種・エリア・予算に合った案件だけを効率的に比較検討できます。",
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: "良い案件を見逃したくない",
              desc: "新着案件をリアルタイムで通知。人気案件は早い者勝ちです。",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-5">
                {item.icon}
              </div>
              <h3 className="font-bold text-lg mb-3">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 使い方ステップ */}
      <section className="bg-gray-50 px-4 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">かんたん3ステップ</h2>
          <p className="text-gray-500 text-center mb-12">登録から案件受け取りまで、たった1分。</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "メールで登録",
                desc: "メールアドレスを入力するだけ。10秒で完了します。",
                color: "from-blue-500 to-blue-600",
              },
              {
                step: "02",
                title: "条件を設定",
                desc: "希望の業種・エリア・価格帯・売上規模を選択。あとから変更も可能。",
                color: "from-indigo-500 to-indigo-600",
              },
              {
                step: "03",
                title: "案件が届く",
                desc: "条件にマッチした案件が見つかり次第、メールで自動通知されます。",
                color: "from-violet-500 to-violet-600",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${item.color} text-white rounded-2xl flex items-center justify-center mx-auto mb-5 text-xl font-bold shadow-lg`}
                >
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 対応サイト */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">主要M&Aサイトを網羅</h2>
        <p className="text-gray-500 text-center mb-12">複数のプラットフォームから案件を自動収集</p>
        <div className="flex flex-wrap justify-center gap-6">
          {["M&Aクラウド", "バトンズ", "トランビ", "その他サイト順次追加"].map((site) => (
            <div
              key={site}
              className="bg-gray-50 border border-gray-200 rounded-xl px-8 py-5 text-gray-700 font-medium"
            >
              {site}
            </div>
          ))}
        </div>
      </section>

      {/* よくある質問 */}
      <section className="bg-gray-50 px-4 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">よくある質問</h2>
          <div className="space-y-4">
            {[
              {
                q: "本当に無料ですか？",
                a: "はい、完全無料です。案件情報の受け取りに費用はかかりません。",
              },
              {
                q: "どのくらいの頻度で案件が届きますか？",
                a: "新着案件が登録され次第、条件にマッチした場合にメールをお送りします。毎日の案件更新で常に最新の情報をお届けします。",
              },
              {
                q: "希望条件はあとから変更できますか？",
                a: "はい、いつでも変更可能です。登録後にお送りするリンクから、条件の追加・変更ができます。",
              },
              {
                q: "個人でも登録できますか？",
                a: "はい、個人・法人を問わず、どなたでもご登録いただけます。",
              },
              {
                q: "配信を停止したい場合は？",
                a: "メールに記載の配信停止リンクから、いつでも停止できます。",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="bg-white rounded-xl border border-gray-200 group"
              >
                <summary className="px-6 py-5 cursor-pointer font-medium text-gray-900 flex items-center justify-between list-none">
                  {item.q}
                  <svg
                    className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section id="register" className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white px-4 py-16 md:py-20">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            条件に合うM&A案件を<br />見逃さない。
          </h2>
          <p className="text-blue-200 mb-8">
            メールアドレスを登録するだけで、あなた専用の案件レーダーが稼働します。
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-200 rounded-lg text-sm border border-red-400/30">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレスを入力"
              className="flex-1 px-4 py-3.5 rounded-lg text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 transition shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              {loading ? "登録中..." : "無料で始める"}
            </button>
          </form>
          <p className="text-blue-300/60 text-xs mt-3">
            登録は無料です &middot; いつでも配信停止可能
          </p>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-gray-400 px-4 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-lg font-bold text-white">M&A<span className="text-blue-400">レーダー</span></span>
          <p className="text-sm">&copy; 2026 M&Aレーダー All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
