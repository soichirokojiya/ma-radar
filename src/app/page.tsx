"use client";

import { useState } from "react";
import { INDUSTRIES, AREAS, PRICE_RANGES } from "@/lib/constants";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    industries: [] as string[],
    areas: [] as string[],
    price_ranges: [] as string[],
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleArray = (key: "industries" | "areas" | "price_ranges", value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.industries.length || !form.areas.length || !form.price_ranges.length) {
      setError("業種・エリア・価格帯をそれぞれ1つ以上選択してください");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "登録に失敗しました");
        return;
      }

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
          <h2 className="text-xl font-bold mb-2">登録完了</h2>
          <p className="text-gray-600">
            ご登録ありがとうございます。<br />
            条件に合うM&A案件が見つかり次第、メールでお知らせします。
          </p>
        </div>
      </div>
    );
  }

  const checkboxClass =
    "flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer transition text-sm";

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
            希望条件を登録するだけで、新着案件をメールで受け取れます。
          </p>
        </div>
      </section>

      {/* 特徴 */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "条件を登録", desc: "業種・エリア・価格帯を選ぶだけ。1分で完了。" },
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
      <section id="register" className="max-w-2xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-bold mb-6 text-center">無料で条件を登録する</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                お名前 *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                希望業種 *（複数選択可）
              </label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((v) => (
                  <label
                    key={v}
                    className={`${checkboxClass} ${
                      form.industries.includes(v)
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.industries.includes(v)}
                      onChange={() => toggleArray("industries", v)}
                    />
                    {v}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                希望エリア *（複数選択可）
              </label>
              <div className="flex flex-wrap gap-2">
                {AREAS.map((v) => (
                  <label
                    key={v}
                    className={`${checkboxClass} ${
                      form.areas.includes(v)
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.areas.includes(v)}
                      onChange={() => toggleArray("areas", v)}
                    />
                    {v}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                希望価格帯 *（複数選択可）
              </label>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map((v) => (
                  <label
                    key={v}
                    className={`${checkboxClass} ${
                      form.price_ranges.includes(v)
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.price_ranges.includes(v)}
                      onChange={() => toggleArray("price_ranges", v)}
                    />
                    {v}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "登録中..." : "無料で登録する"}
            </button>
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
