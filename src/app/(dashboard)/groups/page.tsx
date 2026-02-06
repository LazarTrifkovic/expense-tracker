"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import { GROUP_TYPE_LABELS, type GroupType } from "@/types"

interface Group {
  id: string
  name: string
  description: string | null
  type: GroupType
  members: { id: string; user: { name: string | null } }[]
  _count: { expenses: number }
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch("/api/groups")
        if (response.ok) {
          const data = await response.json()
          setGroups(data)
        }
      } catch (error) {
        console.error("Failed to fetch groups:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchGroups()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Grupe</h1>
        <Link href="/groups/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova grupa
          </Button>
        </Link>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nemate nijednu grupu</h3>
            <p className="text-muted-foreground mb-4">Kreirajte prvu grupu za praćenje troškova</p>
            <Link href="/groups/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Kreiraj grupu
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {GROUP_TYPE_LABELS[group.type]}
                    </span>
                  </div>
                  {group.description && (
                    <CardDescription>{group.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{group.members.length} članova</span>
                    </div>
                    <span>{group._count.expenses} troškova</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
