import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function DecisionManagerPage() {
  const decisions = [
    {
      id: "1",
      formName: "URAR - 123 Main St",
      decisionType: "Approval",
      decisionValue: "APPROVED",
      confidence: 0.95,
      reasoning: "All validation rules passed, property value within acceptable range",
      madeAt: "2024-01-15T10:30:00Z",
      appliedRules: ["Property Value Validation", "LTV Calculation"],
    },
    {
      id: "2",
      formName: "Property Inspection - Oak Ave",
      decisionType: "Review Required",
      decisionValue: "PENDING_REVIEW",
      confidence: 0.72,
      reasoning: "High property value requires senior appraiser review",
      madeAt: "2024-01-15T09:15:00Z",
      appliedRules: ["High Value Review Workflow"],
    },
    {
      id: "3",
      formName: "URAR - Pine Street Condo",
      decisionType: "Rejection",
      decisionValue: "REJECTED",
      confidence: 0.98,
      reasoning: "Property value exceeds maximum threshold",
      madeAt: "2024-01-15T08:45:00Z",
      appliedRules: ["Property Value Validation", "Maximum Value Check"],
    },
  ]

  const getDecisionBadge = (value: string) => {
    switch (value) {
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      case "PENDING_REVIEW":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        )
      default:
        return <Badge variant="secondary">{value}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Decision Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Decisions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+12 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">79.5% approval rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">11.5% require review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.3%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last week</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Decisions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="rules-performance">Rules Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Decisions</CardTitle>
              <CardDescription>Latest automated decisions made by the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {decisions.map((decision) => (
                  <Card key={decision.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getDecisionBadge(decision.decisionValue)}
                          <Badge variant="outline">{Math.round(decision.confidence * 100)}% confidence</Badge>
                        </div>
                        <h3 className="font-semibold">{decision.formName}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{decision.reasoning}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{new Date(decision.madeAt).toLocaleString()}</span>
                          <span>Rules: {decision.appliedRules.join(", ")}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Decision Trends</CardTitle>
                <CardDescription>Decision patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mr-2" />
                  Chart visualization would go here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Confidence Distribution</CardTitle>
                <CardDescription>Distribution of decision confidence scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mr-2" />
                  Chart visualization would go here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules-performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rules Performance</CardTitle>
              <CardDescription>How individual rules are performing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Property Value Validation", triggered: 145, success: 142, rate: 97.9 },
                  { name: "LTV Calculation", triggered: 98, success: 98, rate: 100 },
                  { name: "High Value Review Workflow", triggered: 23, success: 23, rate: 100 },
                  { name: "Maximum Value Check", triggered: 12, success: 11, rate: 91.7 },
                ].map((rule) => (
                  <div key={rule.name} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className="text-sm text-muted-foreground">Triggered {rule.triggered} times</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{rule.rate}%</div>
                      <p className="text-xs text-muted-foreground">
                        {rule.success}/{rule.triggered} successful
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
