'use client'

import type { AiCompany } from '@socialista/types'
import { PencilIcon, Trash2Icon } from 'lucide-react'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

type AiCompaniesTableProps = {
  companies: AiCompany[]
  onEdit: (company: AiCompany) => void
  onDelete: (company: AiCompany) => void
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function AiCompaniesTable({ companies, onEdit, onDelete }: AiCompaniesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="w-[88px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map(company => (
          <TableRow key={company._id}>
            <TableCell>
              <span className="flex items-center gap-2.5">
                <img
                  alt=""
                  className="size-6 object-contain"
                  height={24}
                  src={company.logo}
                  width={24}
                />
                <span className="font-medium">{company.name}</span>
              </span>
            </TableCell>
            <TableCell className="text-muted-foreground">{formatDate(company.createdAt)}</TableCell>
            <TableCell className="text-muted-foreground">{formatDate(company.updatedAt)}</TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Edit ${company.name}`}
                  onClick={() => onEdit(company)}
                >
                  <PencilIcon />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-destructive hover:text-destructive"
                  aria-label={`Delete ${company.name}`}
                  onClick={() => onDelete(company)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
