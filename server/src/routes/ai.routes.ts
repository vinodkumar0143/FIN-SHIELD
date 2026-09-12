import { Router, Response } from 'express'
import { FinancialInvestigatorService } from '../services/financialInvestigator.service.js'
import { AiRecommendationsService } from '../services/aiRecommendations.service.js'
import { AiAssistantService } from '../services/aiAssistant.service.js'
import { NaturalLanguageSearchService } from '../services/naturalLanguageSearch.service.js'
import {
  requireAuth,
  requirePermission,
  type AuthenticatedRequest
} from '../middleware/auth.middleware.js'

export function createAiRouter(): Router {
  const router = Router()
  const investigatorService = new FinancialInvestigatorService()
  const recommendationsService = new AiRecommendationsService()
  const assistantService = new AiAssistantService()
  const searchService = new NaturalLanguageSearchService()

  // 1. Trigger AI Forensic Investigation on an entity
  router.post('/investigate', requireAuth, requirePermission('investigations.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { entityType, entityId } = req.body
      if (!entityType || !entityId) {
        return res.status(400).json({
          success: false,
          error: { message: 'entityType and entityId are required.' }
        })
      }

      const validTypes = ['INVOICE', 'TRANSACTION', 'VENDOR', 'BUDGET']
      if (!validTypes.includes(entityType)) {
        return res.status(400).json({
          success: false,
          error: { message: `Invalid entityType. Must be one of: ${validTypes.join(', ')}` }
        })
      }

      const actor = req.user ? {
        id: req.user.id,
        name: req.user.profile?.full_name || req.user.email,
        role: req.user.role
      } : undefined

      const result = await investigatorService.investigateEntity(entityType, entityId, actor)
      res.json({
        success: true,
        data: result
      })
    } catch (err: any) {
      console.error('[AI INVESTIGATE ROUTE ERROR]', err)
      res.status(500).json({
        success: false,
        error: { message: err.message || 'AI Investigation failed.' }
      })
    }
  })

  // 2. Generate Prioritized AI Recommendations
  router.post('/recommendations', requireAuth, requirePermission('investigations.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { investigationId, entityType, entityReference, riskScore, riskLevel, anomalies, evidence } = req.body
      if (!entityType || !entityReference) {
        return res.status(400).json({
          success: false,
          error: { message: 'entityType and entityReference are required.' }
        })
      }

      const actor = req.user ? {
        id: req.user.id,
        name: req.user.profile?.full_name || req.user.email,
        role: req.user.role
      } : undefined

      if (investigationId) {
        const saved = await recommendationsService.generateAndPersistRecommendation(
          investigationId,
          entityType,
          entityReference,
          riskScore || 50,
          riskLevel || 'MEDIUM',
          anomalies || [],
          evidence || [],
          actor
        )
        return res.json({
          success: true,
          data: saved
        })
      }

      const recommendation = await recommendationsService.generateRecommendation({
        entityType,
        entityReference,
        riskScore: riskScore || 50,
        riskLevel: riskLevel || 'MEDIUM',
        anomalies: anomalies || [],
        evidence: evidence || []
      })

      res.json({
        success: true,
        data: recommendation
      })
    } catch (err: any) {
      console.error('[AI RECOMMENDATION ROUTE ERROR]', err)
      res.status(500).json({
        success: false,
        error: { message: err.message || 'AI Recommendation generation failed.' }
      })
    }
  })

  // 3. Conversational AI Financial Assistant
  router.post('/assistant', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { question } = req.body
      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'question is required.' }
        })
      }

      const actor = req.user ? {
        id: req.user.id,
        name: req.user.profile?.full_name || req.user.email,
        role: req.user.role
      } : undefined

      const result = await assistantService.askAssistant(question.trim(), actor)
      res.json({
        success: true,
        data: result
      })
    } catch (err: any) {
      console.error('[AI ASSISTANT ROUTE ERROR]', err)
      res.status(500).json({
        success: false,
        error: { message: err.message || 'AI Assistant query failed.' }
      })
    }
  })

  // 4. Natural-Language Financial Search
  router.post('/search', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { query } = req.body
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'query string is required.' }
        })
      }

      const actor = req.user ? {
        id: req.user.id,
        name: req.user.profile?.full_name || req.user.email,
        role: req.user.role
      } : undefined

      const result = await searchService.search(query.trim(), actor)
      res.json({
        success: true,
        data: result
      })
    } catch (err: any) {
      console.error('[AI SEARCH ROUTE ERROR]', err)
      res.status(500).json({
        success: false,
        error: { message: err.message || 'Natural language search failed.' }
      })
    }
  })

  return router
}
