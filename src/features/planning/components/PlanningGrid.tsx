/**
 * Planning Grid Component
 * 
 * Displays a hierarchical grid showing:
 * - Room types (parent rows)
 * - Availability rows (AVL) for each room type
 * - Rate plan rows (RATE) for each room type
 * - Date columns (horizontal scrolling)
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PlanningRowSyncIcon from './PlanningRowSyncIcon';
import type { PlanningResponse, PlanningRowType, PlanningCellValue } from '../types';
import { format, parseISO, addDays, differenceInDays, isSameDay } from 'date-fns';

interface PlanningGridProps {
  data: PlanningResponse;
  onCellChange?: (cell: PlanningCellValue) => void;
  editedCells?: Map<string, PlanningCellValue>;
  channexPropertyId?: string | null;
  startDate: string;
  endDate: string;
  rowsNeedingSync?: Set<string>;
  onRowSynced?: (type: 'availability' | 'rate', id: string) => void;
}

const PlanningGrid: React.FC<PlanningGridProps> = ({
  data,
  onCellChange,
  editedCells = new Map(),
  channexPropertyId,
  startDate,
  endDate,
  rowsNeedingSync = new Set(),
  onRowSynced,
}) => {
  const { t } = useTranslation();
  const stickyColumnWidth = 200;

  // Generate date range
  const dates = useMemo(() => {
    const start = parseISO(data.startDate);
    const end = parseISO(data.endDate);
    const days = differenceInDays(end, start) + 1;
    return Array.from({ length: days }, (_, i) => addDays(start, i));
  }, [data.startDate, data.endDate]);

  // Build hierarchical rows
  // In Channex style: Room type row shows AVL values, then rate plan rows below
  const rows = useMemo(() => {
    const result: PlanningRowType[] = [];
    
    data.roomTypes.forEach((roomType) => {
      // Room type row with AVL (availability) - combined into one row
      result.push({ 
        type: 'roomType', 
        roomType,
        // Include availability data for the room type row
        availability: roomType.availability,
      });
      
      // Rate plan rows (no separate AVL row)
      roomType.ratePlans.forEach((ratePlan) => {
        result.push({
          type: 'ratePlan',
          roomTypeId: roomType.id,
          ratePlan,
        });
      });
    });
    
    return result;
  }, [data.roomTypes]);

  // Get cell value (edited or original)
  const getCellValue = (
    row: PlanningRowType,
    date: Date
  ): number | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Room type row shows AVL (availability) values
    if (row.type === 'roomType' && row.availability) {
      const avail = row.availability.find((a) => isSameDay(parseISO(a.date), date));
      const cellKey = `availability-${row.roomType.id}-${dateStr}`;
      const edited = editedCells.get(cellKey);
      // If edited, use edited value; if availability record exists, use it; otherwise return 0 (not null)
      if (edited) {
        return edited.value;
      }
      // If availability record exists and has a value, use it; otherwise 0
      if (avail && avail.id > 0) {
        return avail.availability ?? 0;
      }
      // No availability record exists - show 0
      return 0;
    }
    
    if (row.type === 'availability') {
      const avail = row.availability.find((a) => isSameDay(parseISO(a.date), date));
      const cellKey = `availability-${row.roomTypeId}-${dateStr}`;
      const edited = editedCells.get(cellKey);
      // If edited, use edited value; if availability record exists, use it; otherwise return 0
      if (edited) {
        return edited.value;
      }
      // If availability record exists and has a value, use it; otherwise 0
      if (avail && avail.id > 0) {
        return avail.availability ?? 0;
      }
      // No availability record exists - show 0
      return 0;
    }
    
    if (row.type === 'ratePlan') {
      const rate = row.ratePlan.rates.find((r) => isSameDay(parseISO(r.date), date));
      const cellKey = `rate-${row.ratePlan.id}-${dateStr}`;
      const edited = editedCells.get(cellKey);
      return edited ? edited.value : (rate?.rate ?? null);
    }
    
    return null;
  };

  // Handle cell edit
  const handleCellChange = (
    row: PlanningRowType,
    date: Date,
    value: number
  ) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Room type row edits AVL (availability)
    if (row.type === 'roomType' && row.availability && onCellChange) {
      const avail = row.availability.find((a) => isSameDay(parseISO(a.date), date));
      onCellChange({
        type: 'availability',
        roomTypeId: row.roomType.id,
        date: dateStr,
        value,
        originalValue: avail?.availability ?? null,
      });
    }
    
    if (row.type === 'availability' && onCellChange) {
      const avail = row.availability.find((a) => isSameDay(parseISO(a.date), date));
      onCellChange({
        type: 'availability',
        roomTypeId: row.roomTypeId,
        date: dateStr,
        value,
        originalValue: avail?.availability ?? null,
      });
    }
    
    if (row.type === 'ratePlan' && onCellChange) {
      const rate = row.ratePlan.rates.find((r) => isSameDay(parseISO(r.date), date));
      onCellChange({
        type: 'rate',
        roomTypeId: row.roomTypeId,
        ratePlanId: row.ratePlan.id,
        date: dateStr,
        value,
        originalValue: rate?.rate ?? null,
      });
    }
  };

  // Check if a row has unsaved changes OR needs syncing
  const rowHasChanges = (row: PlanningRowType): boolean => {
    if (row.type === 'roomType' && row.availability) {
      // Check if any availability cells for this room type have been edited
      const hasUnsaved = Array.from(editedCells.keys()).some(key => 
        key.startsWith(`availability-${row.roomType.id}-`)
      );
      // Also check if this row needs syncing (was saved but not synced)
      const needsSync = rowsNeedingSync.has(`availability-${row.roomType.id}`);
      return hasUnsaved || needsSync;
    }
    
    if (row.type === 'ratePlan') {
      // Check if any rate cells for this rate plan have been edited
      const hasUnsaved = Array.from(editedCells.keys()).some(key => 
        key.startsWith(`rate-${row.ratePlan.id}-`)
      );
      // Also check if this row needs syncing (was saved but not synced)
      const needsSync = rowsNeedingSync.has(`rate-${row.ratePlan.id}`);
      return hasUnsaved || needsSync;
    }
    
    return false;
  };
  
  // Check if a row needs syncing (saved but not synced)
  const rowNeedsSync = (row: PlanningRowType): boolean => {
    if (row.type === 'roomType' && row.availability) {
      return rowsNeedingSync.has(`availability-${row.roomType.id}`);
    }
    
    if (row.type === 'ratePlan') {
      return rowsNeedingSync.has(`rate-${row.ratePlan.id}`);
    }
    
    return false;
  };

  // Render row label
  const renderRowLabel = (row: PlanningRowType) => {
    if (row.type === 'roomType') {
      const hasChanges = rowHasChanges(row);
      const needsSync = rowNeedsSync(row);
      return (
        <div className="flex items-center gap-2">
          <div className="font-semibold text-slate-900 text-xs leading-tight flex-1">
            {row.roomType.title} <span className="ml-4">AVL</span>
            {needsSync && (
              <span className="ml-2 text-xs text-amber-600 font-normal">
                ({t('planning.needsSync', { defaultValue: 'needs sync' })})
              </span>
            )}
          </div>
          {channexPropertyId && (
            <PlanningRowSyncIcon
              type="availability"
              roomTypeId={row.roomType.id}
              channexPropertyId={channexPropertyId}
              startDate={data.startDate}
              endDate={data.endDate}
              hasChanges={hasChanges}
              onSynced={() => onRowSynced?.('availability', row.roomType.id)}
            />
          )}
        </div>
      );
    }
    
    if (row.type === 'availability') {
      return (
        <div className="pl-3 text-xs text-slate-600 leading-tight">
          AVL
        </div>
      );
    }
    
    if (row.type === 'ratePlan') {
      // Show rate plan name and code like "rate plan 1 A10 RATE"
      const ratePlanName = row.ratePlan.title || 'Rate Plan';
      const ratePlanCode = row.ratePlan.code ? ` ${row.ratePlan.code}` : '';
      const hasChanges = rowHasChanges(row);
      const needsSync = rowNeedsSync(row);
      return (
        <div className="flex items-center gap-2">
          <div className="pl-3 text-xs text-slate-600 leading-tight flex-1">
            {ratePlanName}{ratePlanCode} <span className="ml-4">RATE</span>
            {needsSync && (
              <span className="ml-2 text-xs text-amber-600 font-normal">
                ({t('planning.needsSync', { defaultValue: 'needs sync' })})
              </span>
            )}
          </div>
          {channexPropertyId && (
            <PlanningRowSyncIcon
              type="rate"
              ratePlanId={row.ratePlan.id}
              channexPropertyId={channexPropertyId}
              startDate={data.startDate}
              endDate={data.endDate}
              hasChanges={hasChanges}
              onSynced={() => onRowSynced?.('rate', row.ratePlan.id)}
            />
          )}
        </div>
      );
    }
    
    return null;
  };

  // Check if cell is edited
  const isCellEdited = (row: PlanningRowType, date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Room type row edits AVL
    if (row.type === 'roomType' && row.availability) {
      return editedCells.has(`availability-${row.roomType.id}-${dateStr}`);
    }
    
    if (row.type === 'availability') {
      return editedCells.has(`availability-${row.roomTypeId}-${dateStr}`);
    }
    
    if (row.type === 'ratePlan') {
      return editedCells.has(`rate-${row.ratePlan.id}-${dateStr}`);
    }
    
    return false;
  };

  return (
    <div className="w-full h-full overflow-hidden rounded-lg border border-slate-200 bg-white flex flex-col">
      <div
        className="flex-1 overflow-auto"
      >
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr>
              {/* Sticky label column */}
              <th
                className="sticky left-0 z-20 min-w-[200px] border-r border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-slate-700"
                style={{ width: stickyColumnWidth }}
              >
                {t('planning.roomType', { defaultValue: 'Room Type / Rate Plan' })}
              </th>
              
              {/* Date columns */}
              {dates.map((date) => (
                <th
                  key={format(date, 'yyyy-MM-dd')}
                  className="min-w-[70px] border-b border-r border-slate-200 pl-1.5 pr-5 py-1.5 text-center text-xs font-medium text-slate-700"
                  style={{ verticalAlign: 'middle' }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-500 leading-none">
                      {format(date, 'EEE')}
                    </span>
                    <span className="font-semibold text-xs leading-none my-0.5">
                      {format(date, 'd')}
                    </span>
                    <span className="text-[10px] text-slate-500 leading-none">
                      {format(date, 'MMM')}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.map((row, rowIndex) => (
              <tr
                key={`${row.type}-${row.type === 'roomType' ? row.roomType.id : row.type === 'availability' ? `avail-${row.roomTypeId}` : `rate-${row.ratePlan.id}`}-${rowIndex}`}
                className={`hover:bg-slate-50 ${
                  row.type === 'roomType' ? 'bg-slate-100' : ''
                }`}
              >
                {/* Sticky label cell */}
                <td
                  className={`sticky left-0 z-10 border-r border-slate-200 px-3 py-1.5 text-xs ${
                    row.type === 'roomType' ? 'bg-slate-100' : 'bg-white'
                  }`}
                  style={{ width: stickyColumnWidth }}
                >
                  {renderRowLabel(row)}
                </td>
                
                {/* Date cells */}
                {dates.map((date) => {
                  const value = getCellValue(row, date);
                  const isEdited = isCellEdited(row, date);
                  const isEmpty = value === null || value === undefined;
                  const isZero = value === 0;
                  
                  // Only allow editing for room type (AVL), availability, and rate rows
                  const isEditable = (row.type === 'roomType' && row.availability) || row.type === 'availability' || row.type === 'ratePlan';
                  
                  return (
                    <td
                      key={format(date, 'yyyy-MM-dd')}
                      className={`border-r border-slate-200 px-1.5 py-1.5 text-center ${
                        isZero && (row.type === 'availability' || (row.type === 'roomType' && row.availability))
                          ? 'bg-red-50 text-red-700'
                          : isEdited
                          ? 'bg-yellow-50 text-yellow-900'
                          : ''
                      }`}
                      style={{ verticalAlign: 'middle' }}
                    >
                      {isEditable ? (
                        <input
                          type="number"
                          min={row.type === 'availability' || (row.type === 'roomType' && row.availability) ? "1" : "0"}
                          max={row.type === 'availability' || (row.type === 'roomType' && row.availability) ? "12" : undefined}
                          step={row.type === 'availability' || (row.type === 'roomType' && row.availability) ? "1" : "0.01"}
                          value={value ?? ''}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            
                            // For availability: only allow integers 1-12
                            if (row.type === 'availability' || (row.type === 'roomType' && row.availability)) {
                              // Allow empty input while typing
                              if (inputValue === '') {
                                handleCellChange(row, date, 0);
                                return;
                              }
                              
                              // Parse as integer (no decimals)
                              const numValue = parseInt(inputValue, 10);
                              
                              // Validate: must be integer between 1-12
                              if (isNaN(numValue) || numValue < 1 || numValue > 12) {
                                // Don't update if invalid
                                return;
                              }
                              
                              // Check if it's a decimal (user typed something like "10.5")
                              if (inputValue.includes('.') || inputValue.includes(',')) {
                                // Reject decimals
                                return;
                              }
                              
                              handleCellChange(row, date, numValue);
                            } else {
                              // For rates: allow decimals
                              const numValue = parseFloat(inputValue) || 0;
                              handleCellChange(row, date, numValue);
                            }
                          }}
                          onBlur={(e) => {
                            // On blur, validate and fix availability values
                            if (row.type === 'availability' || (row.type === 'roomType' && row.availability)) {
                              const inputValue = e.target.value;
                              const numValue = parseInt(inputValue, 10);
                              
                              // If invalid or empty, set to 0 or clamp to valid range
                              if (isNaN(numValue) || numValue < 1) {
                                handleCellChange(row, date, 0);
                              } else if (numValue > 12) {
                                handleCellChange(row, date, 12);
                              } else {
                                // Ensure it's an integer
                                handleCellChange(row, date, Math.floor(numValue));
                              }
                            }
                          }}
                          className={`w-full rounded border border-slate-300 px-1.5 py-1 text-center text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${
                            isZero && (row.type === 'availability' || (row.type === 'roomType' && row.availability))
                              ? 'bg-red-50'
                              : isEdited
                              ? 'bg-yellow-50'
                              : 'bg-white'
                          }`}
                          placeholder="-"
                          style={{ lineHeight: '1.5', height: '24px' }}
                        />
                      ) : (
                        <span className="text-xs text-slate-600 leading-none">
                          {isEmpty ? '—' : typeof value === 'number' ? value.toString() : '—'}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanningGrid;

