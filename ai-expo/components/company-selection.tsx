'use client'

import React, { useState, useEffect } from 'react'
import { Edit, Save } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// 企業データの型定義
type Company = {
  id: number
  name: string
  memo: string
}

// モックデータ（実際の実装ではAPIから取得）
const mockCompanies: Company[] = [
  { id: 1, name: "テクノ株式会社", memo: "" },
  { id: 2, name: "イノベーション工業", memo: "" },
  { id: 3, name: "未来システムズ", memo: "" },
  // ... 他の企業データ
]

export function CompanySelectionComponent() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editMemo, setEditMemo] = useState("")

  useEffect(() => {
    // 実際の実装ではここでAPIからデータをフェッチ
    setCompanies(mockCompanies)
  }, [])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditClick = (company: Company) => {
    setEditingId(company.id)
    setEditMemo(company.memo)
  }

  const handleSaveClick = (id: number) => {
    setCompanies(companies.map(company => 
      company.id === id ? { ...company, memo: editMemo } : company
    ))
    setEditingId(null)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">見学企業の選択</h1>
      <div className="mb-4">
        <Label htmlFor="search">企業を検索</Label>
        <Input
          id="search"
          type="text"
          placeholder="企業名を入力..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-200">
            {filteredCompanies.map((company) => (
              <li key={company.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold">{company.name}</h2>
                    {editingId === company.id ? (
                      <Textarea
                        value={editMemo}
                        onChange={(e) => setEditMemo(e.target.value)}
                        placeholder="メモを入力..."
                        className="mt-2"
                      />
                    ) : (
                      <p className="text-gray-600 mt-1">{company.memo || "メモを追加"}</p>
                    )}
                  </div>
                  <div>
                    {editingId === company.id ? (
                      <Button onClick={() => handleSaveClick(company.id)} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        保存
                      </Button>
                    ) : (
                      <Button onClick={() => handleEditClick(company)} variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        編集
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}