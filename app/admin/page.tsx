'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserByEmail } from '@/utils/db/actions'
import { 
  Users as UsersIcon, 
  FileText, 
  Gift, 
  Trash2, 
  Bell, 
  Printer, 
  Search,
  Edit,
  Trash,
  Plus,
  Download,
  Filter,
  Coins
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'react-hot-toast'

type TableName = 'users' | 'reports' | 'rewards' | 'collected_wastes' | 'notifications' | 'transactions'

interface TableConfig {
  icon: any
  label: string
  columns: string[]
}

const TABLE_CONFIGS: Record<TableName, TableConfig> = {
  users: {
    icon: UsersIcon,
    label: 'Users',
    columns: ['id', 'email', 'name', 'createAt']
  },
  reports: {
    icon: FileText,
    label: 'Reports',
    columns: ['id', 'location', 'wasteType', 'status', 'createAt']
  },
  rewards: {
    icon: Gift,
    label: 'Rewards',
    columns: ['id', 'userId', 'points', 'level', 'createAt']
  },
  collected_wastes: {
    icon: Trash2,
    label: 'Collected Wastes',
    columns: ['id', 'reportId', 'status', 'collectionDate']
  },
  notifications: {
    icon: Bell,
    label: 'Notifications',
    columns: ['id', 'message', 'type', 'createAt']
  },
  transactions: {
    icon: Coins,
    label: 'Transactions',
    columns: ['id', 'userId', 'type', 'amount', 'description', 'date']
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [selectedTable, setSelectedTable] = useState<TableName>('users')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [filters, setFilters] = useState<Record<string, string>>({})

  useEffect(() => {
    const checkAdminAccess = async () => {
      const email = localStorage.getItem('userEmail')
      if (!email) {
        router.push('/')
        return
      }

      try {
        const user = await getUserByEmail(email)
        if (!user?.isAdmin) {
          router.push('/')
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        router.push('/')
      }
    }

    checkAdminAccess()
  }, [router])

  useEffect(() => {
    fetchTableData()
  }, [selectedTable])

  const fetchTableData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/${selectedTable}`)
      const result = await response.json()
      setData(Array.isArray(result) ? result : [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/admin/${selectedTable}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete')
      }

      setData(data.filter(item => item.id !== id))
      toast.success('Item deleted successfully')
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  const handleSave = async (item: any) => {
    try {
      const updateData = { ...item }
      
      if (updateData.createAt) {
        updateData.createdAt = updateData.createAt
        delete updateData.createAt
      }

      const response = await fetch(`/api/admin/${selectedTable}/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update')
      }

      const updatedItem = await response.json()
      
      setData(data.map(d => d.id === item.id ? {
        ...updatedItem,
        createAt: updatedItem.createdAt,
      } : d))
      
      setEditingItem(null)
      toast.success('Item updated successfully')
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('Failed to update item')
    }
  }

  const handlePrint = () => {
    const printContent = document.getElementById('printable-content')
    if (printContent) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${TABLE_CONFIGS[selectedTable].label} Report</title>
              <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid black; padding: 8px; text-align: left; }
                th { background-color: #f3f4f6; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const handleExport = () => {
    const csv = [
      TABLE_CONFIGS[selectedTable].columns.join(','),
      ...data.map(item => 
        TABLE_CONFIGS[selectedTable].columns.map(col => 
          typeof item[col] === 'object' ? JSON.stringify(item[col]) : item[col]
        ).join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedTable}_export.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const filteredData = Array.isArray(data) ? data.filter(item => {
    if (!item) return false;
    
    // Apply search term filter
    const searchMatch = Object.values(item).some(value => 
      value !== null && 
      value !== undefined && 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Apply column filters
    const filterMatch = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const itemValue = item[key];
      return itemValue !== null && 
             itemValue !== undefined && 
             String(itemValue).toLowerCase().includes(value.toLowerCase())
    })

    return searchMatch && filterMatch
  }) : [];

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      <div className="mb-8 border-b border-green-200 dark:border-green-700 pb-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Admin Dashboard</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(TABLE_CONFIGS).map(([key, config]) => (
          <Button
            key={key}
            onClick={() => setSelectedTable(key as TableName)}
            variant={selectedTable === key ? "default" : "outline"}
            className={`flex items-center gap-2 ${
              selectedTable === key 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "border-green-600 dark:border-green-500 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-gray-800"
            }`}
          >
            <config.icon className="h-4 w-4" />
            {config.label}
          </Button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-green-100 dark:border-green-900 p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-green-200 dark:border-green-700 focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline" 
              className="flex items-center gap-2 border-green-600 dark:border-green-500 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleExport} variant="outline" 
              className="flex items-center gap-2 border-green-600 dark:border-green-500 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-x-auto">
          <div id="printable-content" className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-green-200 dark:divide-green-700">
              <thead className="sticky top-0 bg-green-50 dark:bg-gray-900">
                <tr>
                  {TABLE_CONFIGS[selectedTable].columns.map(column => (
                    <th key={column} className="px-3 py-2 text-left text-xs font-medium text-black dark:text-gray-100 uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {column === 'createAt' ? 'DATE' : column.toUpperCase()}
                        <input
                          type="text"
                          placeholder="Filter..."
                          value={filters[column] || ''}
                          onChange={(e) => setFilters({...filters, [column]: e.target.value})}
                          className="ml-1 px-1 py-0.5 text-xs border-green-200 dark:border-green-700 rounded w-20 focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2 bg-green-50 dark:bg-gray-900 text-left text-xs font-medium text-black dark:text-gray-100 uppercase tracking-wider whitespace-nowrap w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-green-200 dark:divide-green-700">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-green-50 dark:hover:bg-gray-700">
                    {TABLE_CONFIGS[selectedTable].columns.map(column => (
                      <td key={column} className="px-3 py-2 text-sm text-black dark:text-gray-100 whitespace-nowrap">
                        {editingItem?.id === item.id ? (
                          <Input
                            type="text"
                            value={editingItem[column]}
                            onChange={(e) => setEditingItem({
                              ...editingItem,
                              [column]: e.target.value
                            })}
                            className="h-8 text-sm dark:bg-gray-700 dark:text-gray-100"
                          />
                        ) : (
                          String(item[column === 'createAt' ? 'createdAt' : column])
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex gap-1">
                        {editingItem?.id === item.id ? (
                          <>
                            <Button
                              onClick={() => handleSave(editingItem)}
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 dark:text-gray-100 dark:border-green-500"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditingItem(null)}
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 dark:text-gray-100 dark:border-green-500"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleEdit(item)}
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 dark:text-gray-100 dark:border-green-500"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(item.id)}
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 