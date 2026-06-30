'use client'

import { ModelTypeLabel } from '@/components/models/model-type-label'
import { COST_UNIT_OPTIONS } from '@/lib/zod/model.schema'
import type { Model } from '@socialista/types'
import { PencilIcon, Trash2Icon } from 'lucide-react'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

type ModelsTableProps = {
  models: Model[]
  onEdit: (model: Model) => void
  onDelete: (model: Model) => void
}

const costUnitLabels = Object.fromEntries(COST_UNIT_OPTIONS.map(option => [option.value, option.label]))

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function ModelsTable({ models, onEdit, onDelete }: ModelsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Cost unit</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="w-[88px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {models.map(model => (
          <TableRow key={model._id}>
            <TableCell className="font-medium">{model.name}</TableCell>
            <TableCell>{model.modelProvider}</TableCell>
            <TableCell>
              <ModelTypeLabel type={model.modelType} />
            </TableCell>
            <TableCell className="tabular-nums">{model.cost}</TableCell>
            <TableCell>{costUnitLabels[model.costUnit] ?? model.costUnit}</TableCell>
            <TableCell className="text-muted-foreground">{formatDate(model.createdAt)}</TableCell>
            <TableCell className="text-muted-foreground">{formatDate(model.updatedAt)}</TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Edit ${model.name}`}
                  onClick={() => onEdit(model)}
                >
                  <PencilIcon />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-destructive hover:text-destructive"
                  aria-label={`Delete ${model.name}`}
                  onClick={() => onDelete(model)}
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
