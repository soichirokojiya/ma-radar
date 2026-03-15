"use client";

import { useState, useEffect, use } from "react";
import { INDUSTRIES, AREAS, PRICE_RANGES, REVENUE_SCALES } from "@/lib/constants";

type FormKey = "industries" | "areas" | "price_ranges" | "revenue_scales";

export default function PreferencesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [form, setForm] = useState({
    industries: [] as string[],
    areas: [] as string[],
    price_ranges: [] as string[],
    revenue_scales: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/buyers/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          setForm({
            industries: data.industries || [],
            areas: data.areas || [],
            price_ranges: data.price_ranges || [],
            revenue_scales: data.revenue_scales || [],
          });
        }
      })
      .catch(() => setError("データの取得に失敗しました"))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleArray = (key: FormKey, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch(`/api/buyers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        setError("保存に失敗しました");
        return;
      }

      setSaved(true);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  const checkboxClass =
    "flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer transition text-sm";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  const sections: { label: string; key: FormKey; options: readonly string[] }[] = [
    { label: "希望業種", key: "industries", options: INDUSTRIES },
    { label: "希望エリア", key: "areas", options: AREAS },
    { label: "希望価格帯（譲渡価格）", key: "price_ranges", options: PRICE_RANGES },
    { label: "希望売上規模", key: "revenue_scales", options: REVENUE_SCALES },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-800 text-white py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold">希望条件の設定</h1>
          <p className="text-blue-200 mt-2">
            条件を設定すると、マッチする案件だけをお届けします
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {saved && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
              希望条件を保存しました！条件に合う案件が見つかり次第、メールでお知らせします。
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {sections.map(({ label, key, options }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {label}（複数選択可）
                </label>
                <div className="flex flex-wrap gap-2">
                  {options.map((v) => (
                    <label
                      key={v}
                      className={`${checkboxClass} ${
                        form[key].includes(v)
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={form[key].includes(v)}
                        onChange={() => toggleArray(key, v)}
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {saving ? "保存中..." : "条件を保存する"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
