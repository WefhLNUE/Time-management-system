export class PunchDto {
  employeeId?: string;

  // ✅ what frontend sends
  timestamp?: string;

  // ✅ what frontend sends
  type?: 'IN' | 'OUT';

  // ⬇️ backward compatibility (if any old code exists)
  time?: string;
  punchType?: 'IN' | 'OUT';

  source?: string;
}
