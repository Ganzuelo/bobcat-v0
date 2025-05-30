"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Trash } from "lucide-react"

// Simplified Sales Grid component for testing
export function SalesGridTest() {
  const [rows, setRows] = useState([{ id: "1", address: "", price: "", date: "" }])

  const addRow = () => {
    setRows([...rows, { id: crypto.randomUUID(), address: "", price: "", date: "" }])
  }

  const removeRow = (id: string) => {
    setRows(rows.filter((row) => row.id !== id))
  }

  const updateRow = (id: string, field: string, value: string) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sales Comparison Grid</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 font-medium text-sm">
            <div className="col-span-5">Address</div>
            <div className="col-span-3">Sale Price</div>
            <div className="col-span-3">Sale Date</div>
            <div className="col-span-1"></div>
          </div>

          {/* Rows */}
          {rows.map((row, index) => (
            <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <Input
                  value={row.address}
                  onChange={(e) => updateRow(row.id, "address", e.target.value)}
                  placeholder="Enter address"
                />
              </div>
              <div className="col-span-3">
                <Input value={row.price} onChange={(e) => updateRow(row.id, "price", e.target.value)} placeholder="$" />
              </div>
              <div className="col-span-3">
                <Input
                  value={row.date}
                  onChange={(e) => updateRow(row.id, "date", e.target.value)}
                  placeholder="MM/DD/YYYY"
                />
              </div>
              <div className="col-span-1">
                <Button variant="ghost" size="icon" onClick={() => removeRow(row.id)} disabled={rows.length === 1}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add Row Button */}
          <Button variant="outline" size="sm" onClick={addRow} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Row
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
