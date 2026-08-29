'use client'

import { ContextSupportLabels } from '@/components/models/context-support-label'
import { ModelTypeLabel } from '@/components/models/model-type-label'
import { COST_UNIT_OPTIONS } from '@/lib/zod/model.schema'
import { formatCredits } from '@/utils/format'
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
          <TableHead>Company</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Context</TableHead>
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
            <TableCell>
              {model.company ? (
                <span className="flex items-center gap-2">
                  <img
                    alt=""
                    className="size-4 object-contain"
                    height={16}
                    src={model.company.logo}
                    width={16}
                  />
                  {model.company.name}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>{model.modelProvider}</TableCell>
            <TableCell>
              <ModelTypeLabel type={model.modelType} />
            </TableCell>
            <TableCell>
              <ContextSupportLabels supports={model.contextSupports} />
            </TableCell>
            <TableCell className="tabular-nums">{formatCredits(model.cost)}</TableCell>
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
