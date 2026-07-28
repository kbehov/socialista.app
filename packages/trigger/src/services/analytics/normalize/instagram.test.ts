import { describe, expect, it } from 'vitest'

import { normalizeInstagramAnalytics } from './instagram.js'

describe('normalizeInstagramAnalytics', () => {
  it('maps a full profile + insights payload', () => {
    const result = normalizeInstagramAnalytics({
      profile: {
        id: '17841400000000000',
        followers_count: 12040,
        follows_count: 310,
        media_count: 88,
      },
      insights: {
        data: [
          { name: 'views', total_value: { value: 88210 } },
          { name: 'reach', total_value: { value: 41200 } },
          { name: 'likes', total_value: { value: 2100 } },
          { name: 'comments', total_value: { value: 420 } },
          { name: 'shares', total_value: { value: 180 } },
          { name: 'saves', total_value: { value: 420 } },
          { name: 'total_interactions', total_value: { value: 3120 } },
        ],
      },
    })

    expect(result.metrics.followerCount).toBe(12040)
    expect(result.metrics.followingCount).toBe(310)
    expect(result.metrics.postsCount).toBe(88)
    expect(result.metrics.views).toBe(88210)
    expect(result.metrics.reach).toBe(41200)
    expect(result.metrics.likes).toBe(2100)
    expect(result.metrics.comments).toBe(420)
    expect(result.metrics.shares).toBe(180)
    expect(result.metrics.saves).toBe(420)
    expect(result.metrics.engagement).toBe(3120)
    expect(result.metrics.engagementRate).toBeCloseTo(3120 / 41200)
    expect(result.metrics.engagementRateBasis).toBe('reach')
    expect(result.missingMetrics).toEqual([])
  })

  it('falls back to followers when reach is missing', () => {
    const result = normalizeInstagramAnalytics({
      profile: { followers_count: 1000, follows_count: 10, media_count: 5 },
      insights: {
        data: [
          { name: 'views', total_value: { value: 500 } },
          { name: 'total_interactions', total_value: { value: 50 } },
        ],
      },
    })

    expect(result.metrics.reach).toBeUndefined()
    expect(result.missingMetrics).toContain('reach')
    expect(result.metrics.engagementRate).toBeCloseTo(0.05)
    expect(result.metrics.engagementRateBasis).toBe('followers')
  })

  it('records missing views without failing', () => {
    const result = normalizeInstagramAnalytics({
      profile: { followers_count: 100 },
      insights: {
        data: [{ name: 'reach', total_value: { value: 40 } }],
      },
    })

    expect(result.metrics.views).toBeUndefined()
    expect(result.missingMetrics).toContain('views')
    expect(result.metrics.reach).toBe(40)
  })

  it('avoids divide-by-zero when followers and reach are zero', () => {
    const result = normalizeInstagramAnalytics({
      profile: { followers_count: 0, follows_count: 0, media_count: 0 },
      insights: {
        data: [
          { name: 'reach', total_value: { value: 0 } },
          { name: 'total_interactions', total_value: { value: 12 } },
        ],
      },
    })

    expect(result.metrics.engagement).toBe(12)
    expect(result.metrics.engagementRate).toBeUndefined()
    expect(result.missingMetrics).toContain('engagementRate')
  })

  it('handles a malformed insights envelope', () => {
    const result = normalizeInstagramAnalytics({
      profile: { followers_count: 50 },
      insights: null,
    })

    expect(result.metrics.followerCount).toBe(50)
    expect(result.missingMetrics).toEqual(
      expect.arrayContaining(['views', 'reach', 'likes', 'comments', 'shares', 'saves', 'engagement']),
    )
  })

  it('does not mark flows missing on gauges-only runs', () => {
    const result = normalizeInstagramAnalytics(
      {
        profile: { followers_count: 50, follows_count: 10, media_count: 3 },
        insights: null,
      },
      { expectFlows: false },
    )

    expect(result.metrics.followerCount).toBe(50)
    expect(result.missingMetrics).toEqual([])
  })

  it('accepts legacy saved metric name', () => {
    const result = normalizeInstagramAnalytics({
      profile: { followers_count: 100 },
      insights: {
        data: [{ name: 'saved', total_value: { value: 9 } }],
      },
    })

    expect(result.metrics.saves).toBe(9)
    expect(result.missingMetrics).not.toContain('saves')
  })

  it('reads the last values[] entry when total_value is absent', () => {
    const result = normalizeInstagramAnalytics({
      profile: { followers_count: 200 },
      insights: {
        data: [
          {
            name: 'views',
            values: [
              { value: 10, end_time: '2026-07-01T00:00:00+0000' },
              { value: 25, end_time: '2026-07-02T00:00:00+0000' },
            ],
          },
        ],
      },
    })

    expect(result.metrics.views).toBe(25)
  })
})
