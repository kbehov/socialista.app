import { describe, expect, it } from 'vitest'

import { normalizeFacebookAnalytics } from './facebook.js'

describe('normalizeFacebookAnalytics', () => {
  it('maps page gauges + current Page Insights metrics', () => {
    const result = normalizeFacebookAnalytics({
      page: { id: '123', followers_count: 5000, fan_count: 4900 },
      insights: {
        data: [
          {
            name: 'page_media_view',
            values: [
              { value: 100, end_time: '2026-07-24T07:00:00+0000' },
              { value: 200, end_time: '2026-07-25T07:00:00+0000' },
            ],
          },
          {
            name: 'page_total_media_view_unique',
            values: [{ value: 150, end_time: '2026-07-25T07:00:00+0000' }],
          },
          {
            name: 'page_actions_post_reactions_like_total',
            values: [{ value: 40, end_time: '2026-07-25T07:00:00+0000' }],
          },
          {
            name: 'page_post_engagements',
            values: [{ value: 80, end_time: '2026-07-25T07:00:00+0000' }],
          },
          {
            name: 'page_positive_feedback_by_type',
            values: [
              {
                value: { like: 10, comment: 5, share: 3 },
                end_time: '2026-07-25T07:00:00+0000',
              },
            ],
          },
          {
            name: 'page_views_total',
            values: [{ value: 55, end_time: '2026-07-25T07:00:00+0000' }],
          },
        ],
      },
    })

    expect(result.metrics.followerCount).toBe(5000)
    expect(result.metrics.views).toBe(300)
    expect(result.metrics.reach).toBe(150)
    expect(result.metrics.likes).toBe(40)
    expect(result.metrics.comments).toBe(5)
    expect(result.metrics.shares).toBe(3)
    expect(result.metrics.profileViews).toBe(55)
    expect(result.metrics.engagement).toBe(80)
    expect(result.metrics.engagementRate).toBeCloseTo(80 / 150)
    expect(result.metrics.engagementRateBasis).toBe('reach')
    expect(result.missingMetrics).toEqual(['saves', 'linkClicks'])
  })

  it('falls back to legacy impression metric names', () => {
    const result = normalizeFacebookAnalytics({
      page: { followers_count: 10 },
      insights: {
        data: [
          { name: 'page_impressions', values: [{ value: 9 }] },
          { name: 'page_impressions_unique', values: [{ value: 7 }] },
        ],
      },
    })

    expect(result.metrics.views).toBe(9)
    expect(result.metrics.reach).toBe(7)
  })

  it('falls back to fan_count when followers_count is absent', () => {
    const result = normalizeFacebookAnalytics(
      { page: { fan_count: 1200 }, insights: null },
      { expectFlows: false },
    )

    expect(result.metrics.followerCount).toBe(1200)
    expect(result.missingMetrics).toEqual([])
  })

  it('does not mark flows missing on gauges-only runs', () => {
    const result = normalizeFacebookAnalytics(
      { page: { followers_count: 10 }, insights: null },
      { expectFlows: false },
    )

    expect(result.missingMetrics).toEqual([])
  })

  it('marks expected flows missing when insights envelope is empty', () => {
    const result = normalizeFacebookAnalytics({
      page: { followers_count: 10 },
      insights: null,
    })

    expect(result.missingMetrics).toEqual(
      expect.arrayContaining([
        'views',
        'reach',
        'likes',
        'comments',
        'shares',
        'saves',
        'profileViews',
        'linkClicks',
        'engagement',
      ]),
    )
  })

  it('falls back to followers for engagement rate when reach is missing', () => {
    const result = normalizeFacebookAnalytics({
      page: { followers_count: 200 },
      insights: {
        data: [
          {
            name: 'page_post_engagements',
            values: [{ value: 20 }],
          },
        ],
      },
    })

    expect(result.metrics.engagementRate).toBeCloseTo(0.1)
    expect(result.metrics.engagementRateBasis).toBe('followers')
    expect(result.missingMetrics).toContain('reach')
  })
})
