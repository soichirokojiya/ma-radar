"use client";

import { useState, useEffect, useCallback } from "react";
import { INDUSTRIES, AREAS, PRICE_RANGES, REVENUE_SCALES, EMPLOYEE_SCALES } from "@/lib/constants";
import type { Deal } from "@/types/database";

const emptyForm: Record<string, string> = {
  title: "",
  industry: INDUSTRIES[0],
  area: AREAS[0],
  price_range: PRICE_RANGES[0],
  revenue_scale: REVENUE_SCALES[0],
  employee_scale: EMPLOYEE_SCALES[0],
  summary: "",
  source_url: "",
};

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchDeals = useCallback(async () => {
    const res = await fetch("/api/deals");
    const data = await res.json();
    setDeals(data);
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (editingId) {
        await fetch(`/api/deals/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setMessage("案件を更新しました");
      } else {
        await fetch("/api/deals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setMessage("案件を登録しました");
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchDeals();
    } catch {
      setMessage("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (deal: Deal) => {
    setForm({
      title: deal.title,
      industry: deal.industry,
      area: deal.area,
      price_range: deal.price_range,
      revenue_scale: deal.revenue_scale || "",
      employee_scale: deal.employee_scale || "",
      summary: deal.summary || "",
      source_url: deal.source_url || "",
    });
    setEditingId(deal.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この案件を削除しますか？")) return;
    await fetch(`/api/deals/${id}`, { method: "DELETE" });
    setMessage("案件を削除しました");
    fetchDeals();
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const selectClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const inputClass = selectClass;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">M&Aレーダー 管理画面</h1>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* 案件登録フォーム */}
        <section className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "案件を編集" : "新規案件登録"}
          </h2>

          {message && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タイトル *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
                placeholder="例：老舗居酒屋の事業譲渡"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  業種 *
                </label>
                <select
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  className={selectClass}
                >
                  {INDUSTRIES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  エリア *
                </label>
                <select
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className={selectClass}
                >
                  {AREAS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  譲渡希望価格帯 *
                </label>
                <select
                  value={form.price_range}
                  onChange={(e) => setForm({ ...form, price_range: e.target.value })}
                  className={selectClass}
                >
                  {PRICE_RANGES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                従業員規模
              </label>
              <select
                value={form.employee_scale}
                onChange={(e) => setForm({ ...form, employee_scale: e.target.value })}
                className={selectClass}
              >
                {EMPLOYEE_SCALES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                概要（100字程度）
              </label>
              <textarea
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                className={inputClass}
                rows={3}
                maxLength={200}
                placeholder="案件の概要を入力してください"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                元サイトURL
              </label>
              <input
                type="url"
                value={form.source_url}
                onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                className={inputClass}
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? "処理中..." : editingId ? "更新" : "登録"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition"
                >
                  キャンセル
                </button>
              )}
            </div>
          </form>
        </section>

        {/* 案件一覧 */}
        <section className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">登録済み案件一覧</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">タイトル</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">業種</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">エリア</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">価格帯</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">通知</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{deal.title}</td>
                    <td className="px-4 py-3">{deal.industry}</td>
                    <td className="px-4 py-3">{deal.area}</td>
                    <td className="px-4 py-3">{deal.price_range}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs ${
                          deal.notified
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {deal.notified ? "済" : "未"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEdit(deal)}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(deal.id)}
                        className="text-red-600 hover:underline"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
                {deals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      案件がありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
