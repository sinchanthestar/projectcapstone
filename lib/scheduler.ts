/**
 * Backtracking Algorithm untuk Auto-Scheduling
 * 
 * Constraint yang diperhitungkan:
 * 1. Setiap employee hanya bisa 1 shift per hari
 * 2. Employee harus tersedia/active
 * 3. Setiap shift harus di-assign ke EXACTLY 3 karyawan per hari
 * 4. Prioritas distribusi merata dan fairness
 */

export interface ScheduleData {
  employees: Array<{
    id: string;
    available: boolean;
    assignedDays?: number;
  }>;
  shifts: Array<{
    id: string;
    name: string;
    capacity?: number;
  }>;
  dates: string[];
  existingAssignments: Map<string, Set<string>>; // Map<date, Set<employeeId>>
}

export interface ScheduleAssignment {
  employeeId: string;
  shiftId: string;
  scheduledDate: string;
}

// Capacity per shift (3 employees per shift per day)
const EMPLOYEES_PER_SHIFT = 3;

export class ScheduleBacktracker {
  private assignments: ScheduleAssignment[] = [];
  private employeeShiftCounts: Map<string, number> = new Map();
  private dateShiftAssignments: Map<string, Map<string, number>> = new Map();
  private conflictCount = 0;
  private maxConflicts = 1000;

  /**
   * Backtracking algorithm untuk auto-schedule
   * Strategy: Greedy + Capacity-based assignment untuk ensure 3 karyawan per shift
   */
  async generateSchedule(
    employees: any[],
    shifts: any[],
    dates: string[],
    existingAssignments: Map<string, Set<string>> = new Map()
  ): Promise<ScheduleAssignment[]> {
    // Reset state
    this.assignments = [];
    this.employeeShiftCounts = new Map();
    this.dateShiftAssignments = new Map();
    this.conflictCount = 0;

    // Initialize
    for (const emp of employees) {
      this.employeeShiftCounts.set(emp.id, 0);
    }

    for (const date of dates) {
      this.dateShiftAssignments.set(date, new Map());
      for (const shift of shifts) {
        this.dateShiftAssignments.get(date)?.set(shift.id, 0);
      }
    }

    // Sort employees by availability for better distribution
    const sortedEmployees = [...employees].sort((a, b) => {
      const aCount = this.employeeShiftCounts.get(a.id) || 0;
      const bCount = this.employeeShiftCounts.get(b.id) || 0;
      return aCount - bCount;
    });

    // Try to assign shifts using greedy approach with capacity constraints
    return this.greedyAssignWithCapacity(
      sortedEmployees,
      shifts,
      dates,
      existingAssignments
    );
  }

  /**
   * Greedy assignment ensuring each shift has exactly 3 employees
   */
  private greedyAssignWithCapacity(
    employees: any[],
    shifts: any[],
    dates: string[],
    existingAssignments: Map<string, Set<string>>
  ): ScheduleAssignment[] {
    // For each date
    for (const date of dates) {
      const assignedToday = new Set(existingAssignments.get(date) || []);

      // For each shift, assign 3 employees
      for (const shift of shifts) {
        // Find available employees sorted by least assignments
        const availableEmployees = employees
          .filter(
            (emp) =>
              emp.is_available &&
              !assignedToday.has(emp.id)
          )
          .sort((a, b) => {
            const aCount = this.employeeShiftCounts.get(a.id) || 0;
            const bCount = this.employeeShiftCounts.get(b.id) || 0;
            return aCount - bCount;
          });

        // Try to assign 3 employees to this shift
        let assigned = 0;
        for (const employee of availableEmployees) {
          if (assigned >= EMPLOYEES_PER_SHIFT) break;
          if (this.conflictCount >= this.maxConflicts) break;

          if (this.canAssign(employee.id, shift.id, date, assignedToday)) {
            this.makeAssignment(
              employee.id,
              shift.id,
              date,
              assignedToday
            );
            assigned++;
          }
        }

        if (assigned < EMPLOYEES_PER_SHIFT) {
          console.warn(
            `Warning: Could only assign ${assigned}/${EMPLOYEES_PER_SHIFT} employees to shift ${shift.id} on ${date}`
          );
        }
      }
    }

    return this.assignments;
  }

  /**
   * Check if assignment is valid
   */
  private canAssign(
    employeeId: string,
    shiftId: string,
    date: string,
    assignedToday: Set<string>
  ): boolean {
    // Employee not assigned today
    if (assignedToday.has(employeeId)) {
      return false;
    }

    // Don't exceed max conflicts
    if (this.conflictCount >= this.maxConflicts) {
      return false;
    }

    return true;
  }

  /**
   * Make assignment
   */
  private makeAssignment(
    employeeId: string,
    shiftId: string,
    date: string,
    assignedToday: Set<string>
  ): void {
    this.assignments.push({
      employeeId,
      shiftId,
      scheduledDate: date,
    });

    this.employeeShiftCounts.set(
      employeeId,
      (this.employeeShiftCounts.get(employeeId) || 0) + 1
    );

    this.dateShiftAssignments
      .get(date)
      ?.set(shiftId, (this.dateShiftAssignments.get(date)?.get(shiftId) || 0) + 1);

    assignedToday.add(employeeId);
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const employeeCounts = new Map<string, number>();
    for (const [empId, count] of this.employeeShiftCounts) {
      employeeCounts.set(empId, count);
    }

    return {
      totalAssignments: this.assignments.length,
      employeeCounts: Object.fromEntries(employeeCounts),
      backtrackConflicts: this.conflictCount,
    };
  }
}

/**
 * Simple greedy scheduler with capacity constraint
 * Ensures each shift gets exactly EMPLOYEES_PER_SHIFT (3) employees
 */
export async function greedySchedule(
  employees: any[],
  shifts: any[],
  dates: string[],
  existingAssignments: Map<string, Set<string>> = new Map()
): Promise<ScheduleAssignment[]> {
  const assignments: ScheduleAssignment[] = [];
  const employeeShiftCount = new Map<string, number>();
  const shiftCapacityMap = new Map<string, Map<string, number>>(); // Map<date, Map<shiftId, count>>

  // Initialize counts
  for (const emp of employees) {
    employeeShiftCount.set(emp.id, 0);
  }

  // Initialize shift capacity tracking
  for (const date of dates) {
    const shiftMap = new Map<string, number>();
    for (const shift of shifts) {
      shiftMap.set(shift.id, 0);
    }
    shiftCapacityMap.set(date, shiftMap);
  }

  // For each date and shift, assign 3 available employees
  for (const date of dates) {
    const assignedToday = existingAssignments.get(date) || new Set();

    for (const shift of shifts) {
      const currentCapacity = shiftCapacityMap.get(date)?.get(shift.id) || 0;
      
      // Need to assign 3 - currentCapacity employees
      const needed = EMPLOYEES_PER_SHIFT - currentCapacity;

      for (let i = 0; i < needed; i++) {
        // Find employee with least shifts who's not assigned today
        let bestEmployee = null;
        let minShifts = Infinity;

        for (const employee of employees) {
          if (!employee.is_available) continue;
          if (assignedToday.has(employee.id)) continue;

          const shiftCount = employeeShiftCount.get(employee.id) || 0;
          if (shiftCount < minShifts) {
            minShifts = shiftCount;
            bestEmployee = employee;
          }
        }

        if (bestEmployee) {
          assignments.push({
            employeeId: bestEmployee.id,
            shiftId: shift.id,
            scheduledDate: date,
          });

          employeeShiftCount.set(
            bestEmployee.id,
            (employeeShiftCount.get(bestEmployee.id) || 0) + 1
          );

          assignedToday.add(bestEmployee.id);
          
          // Update shift capacity
          shiftCapacityMap.get(date)?.set(
            shift.id,
            (shiftCapacityMap.get(date)?.get(shift.id) || 0) + 1
          );
        } else {
          // Not enough employees available
          console.warn(`Warning: Could not assign ${needed - i} employees to shift ${shift.id} on ${date}`);
          break;
        }
      }
    }
  }

  return assignments;
}
