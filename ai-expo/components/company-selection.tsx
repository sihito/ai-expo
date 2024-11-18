'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { generateReport } from '@/lib/openai-config'
import { Edit, FileText, Save, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'

type Company = {
  id: number
  name: string
  memo: string
}

const mockCompanies: Company[] = [
  { id: 1, name: "テクノ株式会社", memo: "" },
  { id: 2, name: "イノベーション工業", memo: "" },
  { id: 3, name: "未来システムズ", memo: "" },
]

export function CompanySelectionComponent() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editMemo, setEditMemo] = useState("")
  const [companyMemos, setCompanyMemos] = useState<Record<number, string>>({})
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [isLoadingDialogOpen, setIsLoadingDialogOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [reportContent, setReportContent] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCompanies(mockCompanies)
    const savedMemos = localStorage.getItem('companyMemos')
    if (savedMemos) {
      setCompanyMemos(JSON.parse(savedMemos))
    }
  }, [])

  useEffect(() => {
    if (!process.env.OPENAI_API_KEY) {
      setError('OpenAI API key is not set. Please check your .env file.');
    }
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditClick = (company: Company) => {
    setEditingId(company.id)
    setEditMemo(companyMemos[company.id] || '')
  }

  const handleSaveClick = (id: number) => {
    const updatedMemos = { ...companyMemos, [id]: editMemo }
    setCompanyMemos(updatedMemos)
    localStorage.setItem('companyMemos', JSON.stringify(updatedMemos))
    setEditingId(null)
  }

  const handleCreateReport = async () => {
    const companiesWithMemos = companies.filter(company => companyMemos[company.id])
    if (companiesWithMemos.length === 0) {
      alert('メモが記入された企業がありません。')
      return
    }
    setIsLoadingDialogOpen(true)
    setError(null)

    try {
      const companyData = companiesWithMemos.map(company => ({
        name: company.name,
        memo: companyMemos[company.id]
      }))

      const generatedReport = await generateReport(companyData)
      setReportContent(generatedReport)
      setIsLoadingDialogOpen(false)
      setIsReportDialogOpen(true)
    } catch (err) {
      setError('報告書の生成中にエラーが発生しました。もう一度お試しください。')
      setIsLoadingDialogOpen(false)
    }
  }

  const handleReportSubmit = () => {
    console.log('報告書を作成しました:', reportContent)
    setIsReportDialogOpen(false)
  }

  const truncateMemo = (memo: string, maxLength: number = 50) => {
    return memo.length > maxLength ? `${memo.substring(0, maxLength)}...` : memo
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-4xl font-bold">Smart Report</h1>
          <Button 
            onClick={handleCreateReport} 
            size="lg"
            className="bg-white text-indigo-700 hover:bg-indigo-100 px-8 py-6 text-lg"
          >
            <FileText className="w-6 h-6" />
            報告書作成
          </Button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto mt-8 p-4">
        <div className="mb-8 relative">
          <Label htmlFor="search" className="text-lg font-medium mb-2 block text-gray-700">企業を検索</Label>
          <div className="relative">
            <Input
              id="search"
              type="text"
              placeholder="企業名を入力..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">{company.name}</h2>
                {editingId !== company.id && (
                  <p className="text-sm text-gray-600 mb-4" aria-label="メモプレビュー">
                    {companyMemos[company.id] 
                      ? truncateMemo(companyMemos[company.id])
                      : "まだメモがありません"}
                  </p>
                )}
                {editingId === company.id ? (
                  <Textarea
                    value={editMemo}
                    onChange={(e) => setEditMemo(e.target.value)}
                    placeholder="メモを入力..."
                    className="w-full mb-4"
                  />
                ) : null}
                <div className="flex flex-col space-y-2">
                  {editingId === company.id ? (
                    <Button onClick={() => handleSaveClick(company.id)} className="w-full bg-green-500 hover:bg-green-600 text-white">
                      <Save className="w-4 h-4" />
                      保存
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleEditClick(company)} 
                      variant={companyMemos[company.id] ? "default" : "outline"} 
                      className={`w-full ${companyMemos[company.id] ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'text-blue-500 border-blue-500 hover:bg-blue-50'}`}
                    >
                      <Edit className="w-4 h-4" />
                      {companyMemos[company.id] ? '再編集' : '編集'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={isLoadingDialogOpen} onOpenChange={setIsLoadingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col justify-center items-center h-40">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-sm text-gray-600">報告書を作成中です</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">報告書作成</DialogTitle>
            <DialogDescription className="text-gray-600">
              AIが生成した報告書の内容です。必要に応じて編集してください。
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Label htmlFor="report-content" className="text-sm font-medium text-gray-700">
              報告書内容
            </Label>
            <Textarea
              id="report-content"
              value={reportContent}
              onChange={(e) => setReportContent(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              rows={10}
            />
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsReportDialogOpen(false)} className="w-full sm:w-auto">
              キャンセル
            </Button>
            <Button type="button" onClick={handleReportSubmit} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
              報告書を作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <strong className="font-bold">エラー:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
    </div>
  )
}