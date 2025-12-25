"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { groupSchema, type GroupInput } from "@/lib/validators"
import { GROUP_TYPE_LABELS } from "@/types"

export default function NewGroupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<GroupInput>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      type: "OTHER",
    },
  })

  const onSubmit = async (data: GroupInput) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create group")
      }

      const group = await response.json()
      toast({
        title: "Uspešno",
        description: "Grupa je kreirana",
      })
      router.push(`/groups/${group.id}`)
    } catch {
      toast({
        title: "Greška",
        description: "Nije moguće kreirati grupu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nova grupa</CardTitle>
          <CardDescription>Kreirajte novu grupu za praćenje troškova</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Naziv grupe</Label>
              <Input
                id="name"
                placeholder="npr. Stan, Putovanje u Grčku..."
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis (opciono)</Label>
              <Input
                id="description"
                placeholder="Kratki opis grupe..."
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tip grupe</Label>
              <Select
                onValueChange={(value) => setValue("type", value as GroupInput["type"])}
                defaultValue="OTHER"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite tip" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GROUP_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Odustani
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Kreiranje..." : "Kreiraj grupu"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
