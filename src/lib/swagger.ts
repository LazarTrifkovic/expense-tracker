import { createSwaggerSpec } from 'next-swagger-doc'

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Expense Tracker API',
        version: '1.0.0',
        description: 'API dokumentacija za Expense Tracker aplikaciju - sistem za pracenje i deljenje troskova u grupama',
        contact: {
          name: 'Expense Tracker Tim',
          email: 'support@expense-tracker.com',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'Auth', description: 'Autentifikacija korisnika' },
        { name: 'Groups', description: 'Upravljanje grupama' },
        { name: 'Expenses', description: 'Upravljanje troskovima' },
        { name: 'Settlements', description: 'Poravnanja dugova' },
        { name: 'Dashboard', description: 'Statistike i pregledi' },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Jedinstveni ID korisnika' },
              email: { type: 'string', format: 'email', description: 'Email adresa' },
              name: { type: 'string', description: 'Ime korisnika' },
              role: { type: 'string', enum: ['USER', 'BOSS', 'TATA', 'SYSTEM_ADMIN'], description: 'Uloga korisnika' },
            },
          },
          Group: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Jedinstveni ID grupe' },
              name: { type: 'string', description: 'Naziv grupe' },
              description: { type: 'string', description: 'Opis grupe' },
              type: { type: 'string', enum: ['APARTMENT', 'TRIP', 'PROJECT', 'OTHER'], description: 'Tip grupe' },
              createdAt: { type: 'string', format: 'date-time', description: 'Datum kreiranja' },
            },
          },
          Expense: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Jedinstveni ID troska' },
              title: { type: 'string', description: 'Naziv troska' },
              amount: { type: 'number', description: 'Iznos' },
              currency: { type: 'string', description: 'Valuta (RSD, EUR, USD)' },
              category: { type: 'string', enum: ['FOOD', 'TRANSPORT', 'UTILITIES', 'ENTERTAINMENT', 'SHOPPING', 'OTHER'], description: 'Kategorija' },
              splitType: { type: 'string', enum: ['EQUAL', 'UNEQUAL', 'PERCENTAGE', 'SHARES'], description: 'Tip podele' },
              date: { type: 'string', format: 'date-time', description: 'Datum troska' },
              groupId: { type: 'string', description: 'ID grupe' },
              paidById: { type: 'string', description: 'ID korisnika koji je platio' },
            },
          },
          Settlement: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Jedinstveni ID poravnanja' },
              amount: { type: 'number', description: 'Iznos' },
              status: { type: 'string', enum: ['PENDING', 'CONFIRMED'], description: 'Status' },
              fromUserId: { type: 'string', description: 'Ko placa' },
              toUserId: { type: 'string', description: 'Kome se placa' },
              groupId: { type: 'string', description: 'ID grupe' },
            },
          },
          Error: {
            type: 'object',
            properties: {
              error: { type: 'string', description: 'Poruka greske' },
            },
          },
        },
      },
      security: [{ BearerAuth: [] }],
    },
  })
  return spec
}
