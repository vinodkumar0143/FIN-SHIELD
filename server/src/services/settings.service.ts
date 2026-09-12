import { SettingsRepository, SystemSettingsRecord } from '../repositories/settings.repository.js'
import { AuditLogsRepository } from '../repositories/auditLogs.repository.js'

export class SettingsService {
  constructor(
    private settingsRepo: SettingsRepository = new SettingsRepository(),
    private auditRepo: AuditLogsRepository = new AuditLogsRepository()
  ) {}

  async getSettings(): Promise<SystemSettingsRecord> {
    return this.settingsRepo.getSettings()
  }

  async updateSettings(
    updates: Partial<SystemSettingsRecord>,
    user: { id: string; email: string; role: string; fullName?: string }
  ): Promise<SystemSettingsRecord> {
    const current = await this.settingsRepo.getSettings()

    // 1. Validation
    if (updates.riskThresholdHigh !== undefined) {
      if (typeof updates.riskThresholdHigh !== 'number' || updates.riskThresholdHigh < 0 || updates.riskThresholdHigh > 100) {
        throw new Error('Risk threshold (High) must be a numeric score between 0 and 100')
      }
    }

    if (updates.riskThresholdCritical !== undefined) {
      if (typeof updates.riskThresholdCritical !== 'number' || updates.riskThresholdCritical < 0 || updates.riskThresholdCritical > 100) {
        throw new Error('Risk threshold (Critical) must be a numeric score between 0 and 100')
      }
    }

    const newHigh = updates.riskThresholdHigh ?? current.riskThresholdHigh
    const newCrit = updates.riskThresholdCritical ?? current.riskThresholdCritical
    if (newCrit < newHigh) {
      throw new Error('Critical risk threshold cannot be lower than the High risk threshold')
    }

    if (updates.budgetAlertThreshold !== undefined) {
      if (typeof updates.budgetAlertThreshold !== 'number' || updates.budgetAlertThreshold < 1 || updates.budgetAlertThreshold > 100) {
        throw new Error('Budget alert threshold must be between 1% and 100%')
      }
    }

    if (updates.budgetBreachThreshold !== undefined) {
      if (typeof updates.budgetBreachThreshold !== 'number' || updates.budgetBreachThreshold < 1) {
        throw new Error('Budget breach threshold must be a positive percentage')
      }
    }

    // 2. Sanitize and exclude forbidden keys
    const sanitized: Partial<SystemSettingsRecord> = { ...updates }
    delete (sanitized as any).apiKey
    delete (sanitized as any).password
    delete (sanitized as any).serviceRole
    delete (sanitized as any).databaseUrl
    sanitized.immutableAuditLedger = true

    // 3. Persist to database
    const saved = await this.settingsRepo.updateSettings(sanitized, user.id)

    // 4. Record audit log
    await this.auditRepo.record({
      user_id: user.id,
      user_name: user.fullName || user.email,
      user_role: user.role,
      action: 'SETTINGS_UPDATE',
      entity_type: 'SYSTEM_SETTINGS',
      entity_id: 'app_config',
      source: 'SETTINGS_CONSOLE',
      reason: `Platform settings modified by ${user.email}`,
      previous_state: current as any,
      new_state: saved as any
    })

    return saved
  }
}
