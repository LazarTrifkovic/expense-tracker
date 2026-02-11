"use client"

import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Expense Tracker API Dokumentacija
          </h1>
          <p className="text-gray-600 mt-2">
            Interaktivna dokumentacija svih API ruta
          </p>
        </div>
        <SwaggerUI url="/api/docs" />
      </div>
    </div>
  )
}
