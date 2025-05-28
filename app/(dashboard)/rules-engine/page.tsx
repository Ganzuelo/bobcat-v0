"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Zap, AlertTriangle, CheckCircle } from "lucide-react"
import { useRuleContext } from "@/hooks/use-rule-context"

interface Rule {
  id: string
  name: string
  description: string
  type: "validation" | "calculation" | "workflow"
  priority: number
  isActive: boolean
  conditions: string
  actions: string
  appliesTo: string[]
}

export default function RulesEnginePage() {
  const [rules, setRules] = useState<Rule[]>([
    {
      id: "1",
      name: "Property Value Validation",
      description: "Ensure property value is within acceptable range",
      type: "validation",
      priority: 1,
      isActive: true,
      conditions: "property_value > 0 AND property_value < 10000000",
      actions: 'REJECT if false, "Property value must be between $1 and $10,000,000"',
      appliesTo: ["urar", "inspection"],
    },
    {
      id: "2",
      name: "Loan-to-Value Calculation",
      description: "Calculate LTV ratio automatically",
      type: "calculation",
      priority: 2,
      isActive: true,
      conditions: "loan_amount > 0 AND property_value > 0",
      actions: "SET ltv_ratio = (loan_amount / property_value) * 100",
      appliesTo: ["urar"],
    },
    {
      id: "3",
      name: "High Value Review Workflow",
      description: "Route high-value properties for additional review",
      type: "workflow",
      priority: 3,
      isActive: true,
      conditions: "property_value > 1000000",
      actions: 'ROUTE_TO senior_appraiser, SET status = "pending_review"',
      appliesTo: ["urar"],
    },
  ])

  const [selectedRule, setSelectedRule] = useState<Rule | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { setCurrentRule } = useRuleContext()

  useEffect(() => {
    setCurrentRule(selectedRule)

    // Cleanup
    return () => {
      setCurrentRule(null)
    }
  }, [selectedRule, setCurrentRule])

  const getRuleTypeColor = (type: Rule["type"]) => {
    switch (type) {
      case "validation":
        return "bg-red-100 text-red-800"
      case "calculation":
        return "bg-blue-100 text-blue-800"
      case "workflow":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRuleTypeIcon = (type: Rule["type"]) => {
    switch (type) {
      case "validation":
        return <AlertTriangle className="h-4 w-4" />
      case "calculation":
        return <Zap className="h-4 w-4" />
      case "workflow":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rules Engine</h1>
          <p className="text-muted-foreground">Define and manage business rules for form validation and processing</p>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Rule
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Rules List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Business Rules</CardTitle>
              <CardDescription>Manage validation, calculation, and workflow rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <Card
                    key={rule.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedRule?.id === rule.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedRule(rule)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getRuleTypeColor(rule.type)}>
                            {getRuleTypeIcon(rule.type)}
                            {rule.type}
                          </Badge>
                          <Badge variant="outline">Priority {rule.priority}</Badge>
                          <Switch checked={rule.isActive} size="sm" onClick={(e) => e.stopPropagation()} />
                        </div>
                        <h3 className="font-semibold">{rule.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {rule.appliesTo.map((formType) => (
                            <Badge key={formType} variant="secondary" className="text-xs">
                              {formType}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedRule(rule)
                            setIsEditing(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setRules(rules.filter((r) => r.id !== rule.id))
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rule Details/Editor */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? "Edit Rule" : "Rule Details"}</CardTitle>
              <CardDescription>{isEditing ? "Configure rule parameters" : "View rule configuration"}</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedRule ? (
                <div className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label>Rule Name</Label>
                        <Input value={selectedRule.name} />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={selectedRule.description} />
                      </div>

                      <div className="space-y-2">
                        <Label>Rule Type</Label>
                        <Select value={selectedRule.type}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="validation">Validation</SelectItem>
                            <SelectItem value="calculation">Calculation</SelectItem>
                            <SelectItem value="workflow">Workflow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Input type="number" value={selectedRule.priority} />
                      </div>

                      <div className="space-y-2">
                        <Label>Conditions</Label>
                        <Textarea
                          value={selectedRule.conditions}
                          placeholder="Enter rule conditions (e.g., property_value > 0)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Actions</Label>
                        <Textarea
                          value={selectedRule.actions}
                          placeholder="Enter actions to take (e.g., REJECT, SET, ROUTE_TO)"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch checked={selectedRule.isActive} />
                        <Label>Active</Label>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <p className="text-sm">{selectedRule.name}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Description</Label>
                        <p className="text-sm text-muted-foreground">{selectedRule.description}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Type</Label>
                        <div className="mt-1">
                          <Badge className={getRuleTypeColor(selectedRule.type)}>
                            {getRuleTypeIcon(selectedRule.type)}
                            {selectedRule.type}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Conditions</Label>
                        <code className="block text-xs bg-muted p-2 rounded mt-1">{selectedRule.conditions}</code>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Actions</Label>
                        <code className="block text-xs bg-muted p-2 rounded mt-1">{selectedRule.actions}</code>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Applies To</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedRule.appliesTo.map((formType) => (
                            <Badge key={formType} variant="secondary">
                              {formType}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button onClick={() => setIsEditing(true)} className="w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Rule
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Select a rule to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
