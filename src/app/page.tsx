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
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4 text-green-500">&#10003;</div>
          <h2 className="text-xl font-bold mb-2">登録完了！</h2>
          <p className="text-gray-600 mb-6">
            ご登録ありがとうございます。<br />
            希望条件を設定すると、条件に合う案件だけをお届けします。
          </p>
          <a
            href={`/preferences/${buyerId}`}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            希望条件を設定する
          </a>
          <p className="text-gray-400 text-sm mt-4">
            あとから設定することもできます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーロー */}
      <section className="bg-blue-800 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">M&Aレーダー</h1>
          <p className="text-lg md:text-xl text-blue-100 mb-2">
            あなたの条件に合うM&A案件を、自動でお届け。
          </p>
          <p className="text-blue-200">
            メールアドレスを登録するだけ。新着案件をメールで受け取れます。
          </p>
        </div>
      </section>

      {/* 特徴 */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "メールで登録", desc: "メールアドレスだけで登録完了。10秒で始められます。" },
            { title: "自動で収集", desc: "複数のM&Aサイトから案件を自動収集。" },
            { title: "メールで通知", desc: "条件に合う案件が見つかったら即座にお知らせ。" },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 登録フォーム */}
      <section id="register" className="max-w-lg mx-auto px-4 pb-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-bold mb-6 text-center">無料で登録する</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 transition text-base"
            >
              {loading ? "登録中..." : "無料で登録する"}
            </button>

            <p className="text-gray-400 text-xs text-center">
              登録後に希望条件（業種・エリア・価格帯）を設定できます
            </p>
          </form>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-800 text-gray-400 text-center py-6 text-sm">
        &copy; 2026 M&Aレーダー
      </footer>
    </div>
  );
}
